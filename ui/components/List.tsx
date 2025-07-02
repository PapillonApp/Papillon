import { useTheme } from "@react-navigation/native";
import React, { useMemo, useCallback, useState } from "react";
import { ViewProps, StyleProp, ViewStyle, ListRenderItemInfo } from "react-native";
import Reanimated, { EntryExitTransition, LinearTransition } from "react-native-reanimated";
import { LegendList } from "@legendapp/list";

import { Animation } from "../utils/Animation";
import Item from "./Item";

interface ListProps extends ViewProps {
  data?: any[]; // Accept data array for large lists
  children?: React.ReactNode;
  disablePadding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  entering?: EntryExitTransition;
  exiting?: EntryExitTransition;
  disableItemAnimation?: boolean; // NEW: disables Reanimated.View for each item
}

// Memoized animation config - frozen for immutability
const LAYOUT_ANIMATION = Animation(LinearTransition, "list");

// Constants for better performance
const BORDER_BOTTOM_WIDTH = 0.5;
const OPACITY_HEX = "25"; // 15% opacity

// Base styles - frozen for immutability and performance
const BASE_CONTAINER_STYLE: ViewStyle = Object.freeze({
  flex: 1,
  width: "100%",
  marginBottom: 12,
  borderRadius: 20,
  borderCurve: "continuous",
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.16,
  shadowRadius: 1.5,
  elevation: 2,
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
  if (!style) return false;
  if (typeof style !== "object") return false;
  
  if (Array.isArray(style)) {
    // Use for loop for better performance than .some()
    for (let i = 0; i < style.length; i++) {
      if (hasPaddingStyle(style[i])) return true;
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

// Optimized Item component checker with WeakMap cache
const itemTypeCache = new WeakMap<any, boolean>();

const isItemComponent = (element: React.ReactElement): boolean => {
  const elementType = element.type as any;
  
  // Check cache first
  if (itemTypeCache.has(elementType)) {
    return itemTypeCache.get(elementType)!;
  }
  
  const isItem = elementType?.displayName === "Item" || elementType === Item;
  itemTypeCache.set(elementType, isItem);
  return isItem;
};

// Optimized child metadata interface
interface ChildMeta {
  readonly child: React.ReactNode;
  readonly isValidElement: boolean;
  readonly needsPadding: boolean;
  readonly borderBottomWidth: number;
  readonly key: React.Key;
  readonly isItem: boolean;
  readonly isLast: boolean;
}

// Custom comparison function for children array
const areChildrenEqual = (prevChildren: React.ReactNode, nextChildren: React.ReactNode): boolean => {
  if (prevChildren === nextChildren) return true;
  
  const prevArray = React.Children.toArray(prevChildren);
  const nextArray = React.Children.toArray(nextChildren);
  
  if (prevArray.length !== nextArray.length) return false;
  
  for (let i = 0; i < prevArray.length; i++) {
    if (prevArray[i] !== nextArray[i]) return false;
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
    entering,
    exiting,
    ...rest
  }) => {
    const { colors } = useTheme();
    
    // Memoize container style with stable object references
    const containerStyle = useMemo(() => {
      const baseStyle = {
        ...BASE_CONTAINER_STYLE,
        backgroundColor: colors.card,
      };
      return style ? [baseStyle, style] : baseStyle;
    }, [colors.card, style]);

    // Memoize border color with hex optimization
    const borderBottomColor = useMemo(() => `${colors.text}${OPACITY_HEX}`, [colors.text]);

    // Optimized contentContainerStyle processing
    const mergedContentContainerStyle = useMemo(() => {
      if (!contentContainerStyle) return null;
      return Array.isArray(contentContainerStyle)
        ? contentContainerStyle.filter(Boolean) as ViewStyle[]
        : [contentContainerStyle] as ViewStyle[];
    }, [contentContainerStyle]);

    // --- OPTIMIZED DATA PREPARATION ---
    // If data prop is provided and already in ChildMeta[] format, use it directly for best performance
    const childrenData: ChildMeta[] = useMemo(() => {
      if (data) {
        // Fast path: if data is already ChildMeta[] (has 'child' and 'isValidElement'), use as is
        if (data.length > 0 && typeof data[0] === 'object' && 'child' in data[0] && 'isValidElement' in data[0]) {
          return data as ChildMeta[];
        }
        // Otherwise, map to ChildMeta
        return data.map((item, index) => {
          if (React.isValidElement(item)) {
            const childProps = item.props as any;
            const hasDisabledPadding = childProps?.disableListPadding;
            const isItem = isItemComponent(item);
            const hasStylePadding = hasPaddingStyle(childProps?.style);
            const needsPadding =
              !disablePadding &&
              !hasDisabledPadding &&
              !isItem &&
              !hasStylePadding;
            return {
              child: item,
              isValidElement: true,
              needsPadding,
              borderBottomWidth: !isItem && index < data.length - 1 ? BORDER_BOTTOM_WIDTH : 0,
              key: item.key ?? index,
              isItem,
              isLast: index === data.length - 1,
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
          } as const;
        });
      }
      // Fallback: children mode (for small lists)
      const childrenArray = React.Children.toArray(children);
      const count = childrenArray.length;
      return childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) {
          return {
            child,
            isValidElement: false,
            needsPadding: false,
            borderBottomWidth: 0,
            key: index,
            isItem: false,
            isLast: false,
          } as const;
        }
        const childProps = child.props as any;
        const hasDisabledPadding = childProps?.disableListPadding;
        const isItem = isItemComponent(child);
        const hasStylePadding = hasPaddingStyle(childProps?.style);
        const needsPadding =
          !disablePadding &&
          !hasDisabledPadding &&
          !isItem &&
          !hasStylePadding;
        return {
          child,
          isValidElement: true,
          needsPadding,
          borderBottomWidth: !isItem && index < count - 1 ? BORDER_BOTTOM_WIDTH : 0,
          key: child.key ?? index,
          isItem,
          isLast: index === count - 1,
        } as const;
      });
    }, [data, children, disablePadding]);

    // --- OPTIMIZED RENDER ITEM ---
    // Precompute static styles for performance
    const staticItemStyle = useMemo(() => [BASE_ITEM_STYLE, mergedContentContainerStyle].filter(Boolean), [mergedContentContainerStyle]);

    // --- LAST VISIBLE INDEX STATE FOR VIRTUALIZED LISTS ---
    const [lastVisibleIndex, setLastVisibleIndex] = useState<number | null>(null);

    // Handler for visible items change (LegendList compatible)
    const onViewableItemsChanged = useCallback((info: { viewableItems: { index: number }[] }) => {
      if (info && info.viewableItems && info.viewableItems.length > 0) {
        const maxIdx = Math.max(...info.viewableItems.map(i => i.index ?? -1));
        setLastVisibleIndex(maxIdx);
      }
    }, []);

    // For LegendList, renderItem receives { item, index }
    const renderItem = useCallback(
      ({ item, index }: { item: ChildMeta; index: number }) => {
        const isLastVisible = lastVisibleIndex === index;
        if (!item.isValidElement) {
          return <React.Fragment key={item.key}>{item.child}</React.Fragment>;
        }
        // Precompute style array only for dynamic parts
        let itemStyle = staticItemStyle;
        if (item.borderBottomWidth > 0 || item.needsPadding) {
          itemStyle = [...staticItemStyle];
          if (item.borderBottomWidth > 0) {
            itemStyle.push({ borderBottomColor, borderBottomWidth: item.borderBottomWidth });
          }
          if (item.needsPadding) {
            itemStyle.push(DEFAULT_PADDING);
          }
        }
        // Use plain View if animation is disabled
        if (rest.disableItemAnimation) {
          return (
            <React.Fragment key={item.key}>
              <Reanimated.View style={itemStyle}>
                {React.isValidElement(item.child)
                  ? React.cloneElement(item.child as any, { isLastVisible, isLast: item.isLast })
                  : item.child}
              </Reanimated.View>
            </React.Fragment>
          );
        }
        return (
          <Reanimated.View
            key={item.key}
            layout={LAYOUT_ANIMATION}
            style={itemStyle}
          >
            {React.isValidElement(item.child)
              ? React.cloneElement(item.child as any, { isLastVisible, isLast: item.isLast })
              : item.child}
          </Reanimated.View>
        );
      },
      [borderBottomColor, staticItemStyle, rest.disableItemAnimation, lastVisibleIndex]
    );

    const keyExtractor = useCallback((item: ChildMeta) => String(item.key), []);

    // --- USE VIRTUALIZATION FOR LARGE LISTS ---
    // If data prop is provided, enable virtualization
    const useVirtualization = !!data;

    return (
      <Reanimated.View
        layout={LAYOUT_ANIMATION}
        style={containerStyle}
        entering={entering}
        exiting={exiting}
        {...rest}
      >
        {useVirtualization ? (
          <LegendList
            data={childrenData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            recycleItems
            estimatedItemSize={48} // Set to your average item height for best perf
            onViewableItemsChanged={onViewableItemsChanged}
          />
        ) : (
          <>
            {childrenData.map((item, idx, arr) =>
              renderItem({ item, index: idx })
            )}
          </>
        )}
      </Reanimated.View>
    );
  },
  // Custom comparison function for better memoization
  (prevProps, nextProps) => {
    // Compare all props except children first (faster)
    const propsToCompare: (keyof ListProps)[] = [
      'disablePadding',
      'contentContainerStyle',
      'entering',
      'exiting',
      'style',
      'data',
    ];
    
    for (const prop of propsToCompare) {
      if (prevProps[prop] !== nextProps[prop]) {
        return false;
      }
    }
    // Compare children last (potentially slower)
    if (prevProps.children !== nextProps.children) return false;
    return true;
  }
);

List.displayName = "List";

export default List;