import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef } from "react";
import { ViewProps, StyleProp, ViewStyle } from "react-native";
import Reanimated, { EntryExitTransition, LinearTransition } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import Item from "./Item";

interface ListProps extends ViewProps {
  children?: React.ReactNode;
  disablePadding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  entering?: EntryExitTransition;
  exiting?: EntryExitTransition;
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
    children,
    disablePadding = false,
    style,
    contentContainerStyle,
    entering,
    exiting,
    ...rest
  }) => {
    const { colors } = useTheme();
    
    // Use refs to track previous values for optimization
    const prevChildrenRef = useRef<React.ReactNode>(null);
    const prevDisablePaddingRef = useRef<boolean>(false);
    const prevChildrenDataRef = useRef<ChildMeta[] | null>(null);

    // Memoize container style with stable object references
    const containerStyle = useMemo(() => {
      const baseStyle = {
        ...BASE_CONTAINER_STYLE,
        backgroundColor: colors.card,
      };
      return style ? [baseStyle, style] : baseStyle;
    }, [colors.card, style]);

    // Optimized children metadata with aggressive memoization
    const childrenData: ChildMeta[] = useMemo(() => {
      // Skip recalculation if children and disablePadding haven't changed
      if (
        prevChildrenRef.current === children &&
        prevDisablePaddingRef.current === disablePadding &&
        prevChildrenDataRef.current
      ) {
        return prevChildrenDataRef.current;
      }

      const childrenArray = React.Children.toArray(children);
      const count = childrenArray.length;
      
      const result = childrenArray.map((child, index) => {
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

      // Cache the result
      prevChildrenRef.current = children;
      prevDisablePaddingRef.current = disablePadding;
      prevChildrenDataRef.current = result;
      
      return result;
    }, [children, disablePadding]);

    // Memoize border color with hex optimization
    const borderBottomColor = useMemo(() => `${colors.text}${OPACITY_HEX}`, [colors.text]);

    // Optimized contentContainerStyle processing
    const mergedContentContainerStyle = useMemo(() => {
      if (!contentContainerStyle) return null;
      return Array.isArray(contentContainerStyle)
        ? contentContainerStyle.filter(Boolean) as ViewStyle[]
        : [contentContainerStyle] as ViewStyle[];
    }, [contentContainerStyle]);

    // Render each child with optimized style creation
    const renderChild = useCallback(
      (childData: ChildMeta) => {
        if (!childData.isValidElement) {
          return childData.child;
        }
        
        // Pre-build style array to avoid recreation
        const itemStyle: ViewStyle[] = [BASE_ITEM_STYLE];
        
        // Add border style only if needed
        if (childData.borderBottomWidth > 0) {
          itemStyle.push({
            borderBottomColor,
            borderBottomWidth: childData.borderBottomWidth,
          });
        }
        
        // Add padding only if needed
        if (childData.needsPadding) {
          itemStyle.push(DEFAULT_PADDING);
        }
        
        // Add content container styles if present
        if (mergedContentContainerStyle) {
          itemStyle.push(...mergedContentContainerStyle);
        }

        // Clone Item with isLast prop only if child accepts it
        let childToRender = childData.child;
        if (childData.isItem && React.isValidElement(childData.child)) {
          childToRender = React.cloneElement(
            childData.child as React.ReactElement<{ isLast?: boolean }>,
            { isLast: childData.isLast }
          );
        }

        return (
          <Reanimated.View
            key={childData.key}
            layout={LAYOUT_ANIMATION}
            style={itemStyle}
          >
            {childToRender}
          </Reanimated.View>
        );
      },
      [borderBottomColor, mergedContentContainerStyle]
    );

    return (
      <Reanimated.View
        layout={LAYOUT_ANIMATION}
        style={containerStyle}
        entering={entering}
        exiting={exiting}
        {...rest}
      >
        {childrenData.map(renderChild)}
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
      'style'
    ];
    
    for (const prop of propsToCompare) {
      if (prevProps[prop] !== nextProps[prop]) {
        return false;
      }
    }
    
    // Compare children last (potentially slower)
    return areChildrenEqual(prevProps.children, nextProps.children);
  }
);

List.displayName = "List";

export default List;