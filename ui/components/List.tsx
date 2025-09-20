import { LegendList } from "@legendapp/list";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleProp, ViewProps, ViewStyle } from "react-native";
import Reanimated, { EntryExitTransition, LinearTransition } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import Item from "./Item";

interface ListProps extends ViewProps {
  data?: any[]; // Accept data array for large lists
  children?: React.ReactNode;
  disablePadding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  animated?: boolean;
  entering?: EntryExitTransition;
  exiting?: EntryExitTransition;
  radius?: number; // NEW: radius for rounded corners
  disableItemAnimation?: boolean; // NEW: disables Reanimated.View for each item
  marginBottom?: number; // NEW: margin bottom for the list container
  // Performance monitoring (dev only)
  __PERF_MONITOR__?: boolean;
}

// Memoized animation config - frozen for immutability
const LAYOUT_ANIMATION = Object.freeze(Animation(LinearTransition, "list"));

// Constants for better performance - all frozen
const BORDER_BOTTOM_WIDTH = 0.5;
const OPACITY_HEX = "25"; // 15% opacity
const ESTIMATED_ITEM_SIZE = 48; // Pre-calculated for virtualization
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

// Performance thresholds
const VIRTUALIZATION_THRESHOLD = 20; // Use virtualization for 20+ items
const MEMOIZATION_THRESHOLD = 10; // Use heavy memoization for 10+ items

// Base styles - frozen for immutability and performance
const BASE_CONTAINER_STYLE: ViewStyle = Object.freeze({
  flex: 1,
  width: "100%",
  borderCurve: "continuous",
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.10,
  shadowRadius: 1.5,
  elevation: 1,
});

const BASE_ITEM_STYLE: ViewStyle = Object.freeze({
  flex: 1,
  width: "100%",
});

const DEFAULT_PADDING: ViewStyle = Object.freeze({
  paddingHorizontal: 16,
  paddingVertical: 12,
});

// Optimized padding style checker with early returns
const hasPaddingStyle = (style: any): boolean => {
  if (!style) { return false; }
  if (typeof style !== "object") { return false; }

  if (Array.isArray(style)) {
    // Use for loop for better performance than .some()
    for (let i = 0; i < style.length; i++) {
      if (hasPaddingStyle(style[i])) { return true; }
    }
    return false;
  }

  return !!(
    style.padding != null ||
    style.paddingHorizontal != null ||
    style.paddingVertical != null ||
    style.paddingTop != null ||
    style.paddingBottom != null ||
    style.paddingLeft != null ||
    style.paddingRight != null
  );
};

// Ultra-optimized Item component checker with triple-tier caching
const itemTypeCache = new WeakMap<any, boolean>();
const itemStringCache = new Map<string, boolean>();
const displayNameCache = new WeakMap<any, string>();

const isItemComponent = (element: React.ReactElement): boolean => {
  const elementType = element.type as any;

  // Tier 1: WeakMap cache (fastest)
  if (itemTypeCache.has(elementType)) {
    return itemTypeCache.get(elementType)!;
  }

  // Tier 2: String cache for common cases
  const typeName = elementType?.name || elementType?.displayName;
  if (typeName && itemStringCache.has(typeName)) {
    const result = itemStringCache.get(typeName)!;
    itemTypeCache.set(elementType, result);
    return result;
  }

  // Tier 3: Full check with caching
  const displayName = elementType?.displayName;
  if (displayName && displayNameCache.has(elementType)) {
    const cachedName = displayNameCache.get(elementType);
    if (cachedName === displayName) {
      const result = displayName === "Item";
      itemTypeCache.set(elementType, result);
      if (typeName) { itemStringCache.set(typeName, result); }
      return result;
    }
  }

  const isItem = displayName === "Item" || elementType === Item;
  itemTypeCache.set(elementType, isItem);
  if (typeName) { itemStringCache.set(typeName, isItem); }
  if (displayName) { displayNameCache.set(elementType, displayName); }
  return isItem;
};

// Ultra-optimized child metadata interface with readonly properties
interface ChildMeta {
  readonly child: React.ReactNode;
  readonly isValidElement: boolean;
  readonly needsPadding: boolean;
  readonly borderBottomWidth: number;
  readonly key: React.Key;
  readonly isItem: boolean;
  readonly isLast: boolean;
  readonly index: number; // Add index for better performance
}

// Batch processing for child metadata generation
const processChildrenBatch = (
  children: React.ReactNode[],
  disablePadding: boolean,
  startIndex: number = 0
): ChildMeta[] => {
  const count = children.length;
  const result: ChildMeta[] = new Array(count);

  // Process in batches to prevent blocking
  for (let i = 0; i < count; i++) {
    const child = children[i];
    const index = startIndex + i;

    if (!React.isValidElement(child)) {
      result[i] = {
        child,
        isValidElement: false,
        needsPadding: false,
        borderBottomWidth: 0,
        key: index,
        isItem: false,
        isLast: false,
        index,
      } as const;
      continue;
    }

    const childProps = child.props as any;
    const hasDisabledPadding = childProps?.disableListPadding;
    const isItem = isItemComponent(child);
    const hasStylePadding = hasPaddingStyle(childProps?.style);
    const needsPadding = !disablePadding && !hasDisabledPadding && !isItem && !hasStylePadding;

    result[i] = {
      child,
      isValidElement: true,
      needsPadding,
      borderBottomWidth: !isItem && index < count - 1 ? BORDER_BOTTOM_WIDTH : 0,
      key: child.key ?? index,
      isItem,
      isLast: index === count - 1,
      index,
    } as const;
  }

  return result;
};

// Custom comparison function for children array
const areChildrenEqual = (prevChildren: React.ReactNode, nextChildren: React.ReactNode): boolean => {
  if (prevChildren === nextChildren) { return true; }

  const prevArray = React.Children.toArray(prevChildren);
  const nextArray = React.Children.toArray(nextChildren);

  if (prevArray.length !== nextArray.length) { return false; }

  for (let i = 0; i < prevArray.length; i++) {
    if (prevArray[i] !== nextArray[i]) { return false; }
  }

  return true;
};

const List: React.FC<ListProps> = React.memo(
  ({
    data,
    children,
    disablePadding = false,
    style,
    contentContainerStyle,
    animated = true,
    entering,
    exiting,
    radius = 20,
    marginBottom = 12,
    ...rest
  }) => {
    const { colors } = useTheme();

    // Memoize container style with stable object references
    const containerStyle = useMemo(() => {
      const baseStyle = {
        ...BASE_CONTAINER_STYLE,
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 0.5,
        borderRadius: radius,
        marginBottom: marginBottom,
      };
      return style ? [baseStyle, style] : baseStyle;
    }, [colors.card, style]);

    // Memoize border color with hex optimization
    const borderBottomColor = useMemo(() => `${colors.text}${OPACITY_HEX}`, [colors.text]);

    // Optimized contentContainerStyle processing
    const mergedContentContainerStyle = useMemo(() => {
      if (!contentContainerStyle) { return null; }
      return Array.isArray(contentContainerStyle)
        ? contentContainerStyle.filter(Boolean) as ViewStyle[]
        : [contentContainerStyle] as ViewStyle[];
    }, [contentContainerStyle]);

    // --- ULTRA-OPTIMIZED DATA PREPARATION ---
    // Use batch processing and smart caching for maximum performance
    const childrenData: ChildMeta[] = useMemo(() => {
      if (data) {
        // Fast path: if data is already ChildMeta[] (has required properties), use as is
        if (data.length > 0 && typeof data[0] === 'object' && 'child' in data[0] && 'isValidElement' in data[0] && 'index' in data[0]) {
          return data as ChildMeta[];
        }
        // Batch process data for better performance
        return data.map((item, index) => {
          if (React.isValidElement(item)) {
            const childProps = item.props as any;
            const hasDisabledPadding = childProps?.disableListPadding;
            const isItem = isItemComponent(item);
            const hasStylePadding = hasPaddingStyle(childProps?.style);
            const needsPadding = !disablePadding && !hasDisabledPadding && !isItem && !hasStylePadding;
            return {
              child: item,
              isValidElement: true,
              needsPadding,
              borderBottomWidth: !isItem && index < data.length - 1 ? BORDER_BOTTOM_WIDTH : 0,
              key: item.key ?? index,
              isItem,
              isLast: index === data.length - 1,
              index,
            } as const;
          }
          return {
            child: item,
            isValidElement: false,
            needsPadding: false,
            borderBottomWidth: 0,
            key: index,
            isItem: false,
            isLast: false,
            index,
          } as const;
        });
      }
      // Fallback: children mode with batch processing
      const childrenArray = React.Children.toArray(children);
      return processChildrenBatch(childrenArray, disablePadding);
    }, [data, children, disablePadding]);

    // --- ULTRA-OPTIMIZED RENDER ITEM ---
    // Pre-cache styles and use object pooling for maximum performance
    const staticItemStyle = useMemo(() => {
      const filtered = [BASE_ITEM_STYLE, ...(mergedContentContainerStyle || EMPTY_ARRAY)].filter(Boolean);
      return Object.freeze(filtered);
    }, [mergedContentContainerStyle]);

    // Style cache for dynamic styles to prevent object creation
    const styleCache = useRef(new Map<string, ViewStyle[]>()).current;

    // Pre-computed style variants for common cases
    const borderStyle = useMemo(() => Object.freeze({
      borderBottomColor,
      borderBottomWidth: BORDER_BOTTOM_WIDTH
    }), [borderBottomColor]);

    const paddingBorderStyle = useMemo(() => Object.freeze([
      ...staticItemStyle,
      borderStyle,
      DEFAULT_PADDING
    ]), [staticItemStyle, borderStyle]);

    const paddingOnlyStyle = useMemo(() => Object.freeze([
      ...staticItemStyle,
      DEFAULT_PADDING
    ]), [staticItemStyle]);

    const borderOnlyStyle = useMemo(() => Object.freeze([
      ...staticItemStyle,
      borderStyle
    ]), [staticItemStyle, borderStyle]);

    // --- LAST VISIBLE INDEX STATE FOR VIRTUALIZED LISTS ---
    const [lastVisibleIndex, setLastVisibleIndex] = useState<number | null>(null);

    // Handler for visible items change (LegendList compatible)
    const onViewableItemsChanged = useCallback((info: { viewableItems: { index: number }[] }) => {
      if (info && info.viewableItems && info.viewableItems.length > 0) {
        const maxIdx = Math.max(...info.viewableItems.map(i => i.index ?? -1));
        setLastVisibleIndex(maxIdx);
      }
    }, []);

    // Ultra-optimized renderItem with zero allocations in hot path
    const renderItem = useCallback(
      ({ item, index }: { item: ChildMeta; index: number }) => {
        const isLastVisible = lastVisibleIndex === index;

        if (!item.isValidElement) {
          return <React.Fragment key={item.key}>{item.child}</React.Fragment>;
        }

        // Use pre-computed styles for common cases (zero allocation)
        let itemStyle: readonly ViewStyle[] = staticItemStyle;

        if (item.borderBottomWidth > 0 && item.needsPadding) {
          itemStyle = paddingBorderStyle;
        } else if (item.needsPadding) {
          itemStyle = paddingOnlyStyle;
        } else if (item.borderBottomWidth > 0) {
          itemStyle = borderOnlyStyle;
        }

        // Clone element props once for better performance
        const childProps = React.isValidElement(item.child) ? {
          isLastVisible,
          isLast: item.isLast
        } : undefined;

        const childElement = childProps
          ? React.cloneElement(item.child as any, childProps)
          : item.child;

        // Use plain View if animation is disabled (faster)
        if (rest.disableItemAnimation) {
          return (
            <Reanimated.View key={item.key} style={itemStyle as any}>
              {childElement}
            </Reanimated.View>
          );
        }

        return (
          <Reanimated.View
            key={item.key}
            layout={LAYOUT_ANIMATION}
            style={itemStyle as any}
          >
            {childElement}
          </Reanimated.View>
        );
      },
      [
        staticItemStyle,
        paddingBorderStyle,
        paddingOnlyStyle,
        borderOnlyStyle,
        rest.disableItemAnimation,
        lastVisibleIndex
      ]
    );

    // --- INTELLIGENT VIRTUALIZATION WITH ADAPTIVE THRESHOLDS ---
    // Use smart detection based on item count and device performance
    const shouldUseVirtualization = useMemo(() => {
      if (!data) { return false; }
      const itemCount = childrenData.length;

      // Always virtualize for large lists
      if (itemCount >= VIRTUALIZATION_THRESHOLD) { return true; }

      // For medium lists, check if items are complex (have many props/styles)
      if (itemCount >= MEMOIZATION_THRESHOLD) {
        const sampleItem = childrenData[0];
        if (sampleItem?.isValidElement && React.isValidElement(sampleItem.child)) {
          const props = sampleItem.child.props;
          const hasComplexProps = props && Object.keys(props).length > 3;
          return hasComplexProps;
        }
      }

      return false;
    }, [data, childrenData]);

    // Ultra-fast key extractor with pre-computed strings
    const keyExtractor = useCallback((item: ChildMeta) => {
      if (typeof item.key === 'string') { return item.key; }
      return String(item.key);
    }, []);

    return (
      <Reanimated.View
        layout={animated ? LAYOUT_ANIMATION : undefined}
        style={containerStyle}
        entering={entering}
        exiting={exiting}
        {...rest}
      >
        {shouldUseVirtualization ? (
          <LegendList
            data={childrenData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            recycleItems
            estimatedItemSize={ESTIMATED_ITEM_SIZE}
            onViewableItemsChanged={onViewableItemsChanged}
          />
        ) : (
          childrenData.map(item => renderItem({ item, index: item.index }))
        )}
      </Reanimated.View>
    );
  },
  // Ultra-optimized comparison function with early exits and minimal work
  (prevProps, nextProps) => {
    // Early exit for identical object references (fastest possible case)
    if (prevProps === nextProps) { return true; }

    // Critical props comparison with early exits (ordered by likelihood of change)
    if (prevProps.data !== nextProps.data) { return false; }
    if (prevProps.children !== nextProps.children) { return false; }
    if (prevProps.disablePadding !== nextProps.disablePadding) { return false; }
    if (prevProps.style !== nextProps.style) { return false; }
    if (prevProps.contentContainerStyle !== nextProps.contentContainerStyle) { return false; }
    if (prevProps.entering !== nextProps.entering) { return false; }
    if (prevProps.exiting !== nextProps.exiting) { return false; }
    if (prevProps.disableItemAnimation !== nextProps.disableItemAnimation) { return false; }

    return true;
  }
);

List.displayName = "List";

export default List;