import { LegendList } from "@legendapp/list";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { StyleProp, ViewProps, ViewStyle } from "react-native";
import Reanimated, { EntryExitTransition, LinearTransition } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import Item from "./Item";

interface ListProps extends ViewProps {
  data?: any[];
  children?: React.ReactNode;
  disablePadding?: boolean;
  ignoreBorder?: boolean; // NEW: suppresses border bottom for all items
  contentContainerStyle?: StyleProp<ViewStyle>;
  animated?: boolean;
  entering?: EntryExitTransition;
  exiting?: EntryExitTransition;
  radius?: number;
  disableItemAnimation?: boolean;
  marginBottom?: number;
  __PERF_MONITOR__?: boolean;
}

const LAYOUT_ANIMATION = Object.freeze(Animation(LinearTransition, "list"));
const BORDER_BOTTOM_WIDTH = 0.5;
const OPACITY_HEX = "25";
const ESTIMATED_ITEM_SIZE = 48;
const EMPTY_ARRAY = Object.freeze([]);

const VIRTUALIZATION_THRESHOLD = 20;
const MEMOIZATION_THRESHOLD = 10;

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

const hasPaddingStyle = (style: any): boolean => {
  if (!style || typeof style !== "object") { return false; }
  if (Array.isArray(style)) {
    for (let i = 0; i < style.length; i++) {
      if (hasPaddingStyle(style[i])) { return true; }
    }
    return false;
  }
  return !!(style.padding != null || style.paddingHorizontal != null || style.paddingVertical != null || style.paddingTop != null || style.paddingBottom != null || style.paddingLeft != null || style.paddingRight != null);
};

const itemTypeCache = new WeakMap<any, boolean>();
const itemStringCache = new Map<string, boolean>();
const displayNameCache = new WeakMap<any, string>();

const isItemComponent = (element: React.ReactElement): boolean => {
  const elementType = element.type as any;
  if (itemTypeCache.has(elementType)) { return itemTypeCache.get(elementType)!; }

  const typeName = elementType?.name || elementType?.displayName;
  if (typeName && itemStringCache.has(typeName)) {
    const result = itemStringCache.get(typeName)!;
    itemTypeCache.set(elementType, result);
    return result;
  }

  const displayName = elementType?.displayName;
  const isItem = displayName === "Item" || elementType === Item;
  itemTypeCache.set(elementType, isItem);
  if (typeName) { itemStringCache.set(typeName, isItem); }
  return isItem;
};

interface ChildMeta {
  readonly child: React.ReactNode;
  readonly isValidElement: boolean;
  readonly needsPadding: boolean;
  readonly borderBottomWidth: number;
  readonly key: React.Key;
  readonly isItem: boolean;
  readonly isLast: boolean;
  readonly index: number;
}

const processChildrenBatch = (
  children: React.ReactNode[],
  disablePadding: boolean,
  ignoreBorder: boolean, // Added
  startIndex: number = 0
): ChildMeta[] => {
  const count = children.length;
  const result: ChildMeta[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const child = children[i];
    const index = startIndex + i;

    if (!React.isValidElement(child)) {
      result[i] = { child, isValidElement: false, needsPadding: false, borderBottomWidth: 0, key: index, isItem: false, isLast: false, index } as const;
      continue;
    }

    const childProps = child.props as any;
    const isItem = isItemComponent(child);
    const needsPadding = !disablePadding && !childProps?.disableListPadding && !isItem && !hasPaddingStyle(childProps?.style);

    // Updated Logic: Check ignoreBorder
    const shouldHaveBorder = !ignoreBorder && !isItem && index < count - 1;

    result[i] = {
      child,
      isValidElement: true,
      needsPadding,
      borderBottomWidth: shouldHaveBorder ? BORDER_BOTTOM_WIDTH : 0,
      key: child.key ?? index,
      isItem,
      isLast: index === count - 1,
      index,
    } as const;
  }
  return result;
};

const List: React.FC<ListProps> = React.memo(
  ({
    data,
    children,
    disablePadding = false,
    ignoreBorder = false, // Destructured
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
    }, [colors.card, colors.border, style, radius, marginBottom]);

    const borderBottomColor = useMemo(() => `${colors.text}${OPACITY_HEX}`, [colors.text]);

    const mergedContentContainerStyle = useMemo(() => {
      if (!contentContainerStyle) { return null; }
      return Array.isArray(contentContainerStyle) ? contentContainerStyle.filter(Boolean) : [contentContainerStyle];
    }, [contentContainerStyle]);

    const childrenData: ChildMeta[] = useMemo(() => {
      if (data) {
        return data.map((item, index) => {
          if (React.isValidElement(item)) {
            const childProps = item.props as any;
            const isItem = isItemComponent(item);
            const needsPadding = !disablePadding && !childProps?.disableListPadding && !isItem && !hasPaddingStyle(childProps?.style);
            const shouldHaveBorder = !ignoreBorder && !isItem && index < data.length - 1;

            return {
              child: item,
              isValidElement: true,
              needsPadding,
              borderBottomWidth: shouldHaveBorder ? BORDER_BOTTOM_WIDTH : 0,
              key: item.key ?? index,
              isItem,
              isLast: index === data.length - 1,
              index,
            } as const;
          }
          return { child: item, isValidElement: false, needsPadding: false, borderBottomWidth: 0, key: index, isItem: false, isLast: false, index } as const;
        });
      }
      return processChildrenBatch(React.Children.toArray(children), disablePadding, ignoreBorder);
    }, [data, children, disablePadding, ignoreBorder]);

    const staticItemStyle = useMemo(() => [BASE_ITEM_STYLE, ...(mergedContentContainerStyle || EMPTY_ARRAY)].filter(Boolean), [mergedContentContainerStyle]);

    const borderStyle = useMemo(() => Object.freeze({ borderBottomColor, borderBottomWidth: BORDER_BOTTOM_WIDTH }), [borderBottomColor]);
    const paddingBorderStyle = useMemo(() => Object.freeze([...staticItemStyle, borderStyle, DEFAULT_PADDING]), [staticItemStyle, borderStyle]);
    const paddingOnlyStyle = useMemo(() => Object.freeze([...staticItemStyle, DEFAULT_PADDING]), [staticItemStyle]);
    const borderOnlyStyle = useMemo(() => Object.freeze([...staticItemStyle, borderStyle]), [staticItemStyle, borderStyle]);

    const [lastVisibleIndex, setLastVisibleIndex] = useState<number | null>(null);

    const onViewableItemsChanged = useCallback((info: { viewableItems: { index: number }[] }) => {
      if (info?.viewableItems?.length > 0) {
        setLastVisibleIndex(Math.max(...info.viewableItems.map(i => i.index ?? -1)));
      }
    }, []);

    const renderItem = useCallback(
      ({ item, index }: { item: ChildMeta; index: number }) => {
        const isLastVisible = lastVisibleIndex === index;
        if (!item.isValidElement) { return <React.Fragment key={item.key}>{item.child}</React.Fragment>; }

        let itemStyle: any = staticItemStyle;
        if (item.borderBottomWidth > 0 && item.needsPadding) { itemStyle = paddingBorderStyle; }
        else if (item.needsPadding) { itemStyle = paddingOnlyStyle; }
        else if (item.borderBottomWidth > 0) { itemStyle = borderOnlyStyle; }

        const childElement = React.cloneElement(item.child as any, { isLastVisible, isLast: item.isLast });

        return (
          <Reanimated.View
            key={item.key}
            layout={rest.disableItemAnimation ? undefined : LAYOUT_ANIMATION}
            style={itemStyle}
          >
            {childElement}
          </Reanimated.View>
        );
      },
      [staticItemStyle, paddingBorderStyle, paddingOnlyStyle, borderOnlyStyle, rest.disableItemAnimation, lastVisibleIndex]
    );

    const shouldUseVirtualization = useMemo(() => {
      if (!data) { return false; }
      return childrenData.length >= VIRTUALIZATION_THRESHOLD;
    }, [data, childrenData.length]);

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
            keyExtractor={(item: ChildMeta) => String(item.key)}
            estimatedItemSize={ESTIMATED_ITEM_SIZE}
            onViewableItemsChanged={onViewableItemsChanged}
          />
        ) : (
          childrenData.map(item => renderItem({ item, index: item.index }))
        )}
      </Reanimated.View>
    );
  },
  (prev, next) => (
    prev.data === next.data &&
    prev.children === next.children &&
    prev.disablePadding === next.disablePadding &&
    prev.ignoreBorder === next.ignoreBorder && // Added to memo check
    prev.style === next.style
  )
);

List.displayName = "List";
export default List;