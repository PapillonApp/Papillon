import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef } from "react";
import { Pressable, PressableProps } from "react-native";
import Reanimated, { Easing, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);
const LAYOUT_ANIMATION = Animation(LinearTransition, "list");

export const LEADING_TYPE = Symbol("Leading");
export const TRAILING_TYPE = Symbol("Trailing");

function Leading({ children, ...rest }: PressableProps) {
  return (
    <AnimatedPressable {...rest} layout={LAYOUT_ANIMATION}>
      {children}
    </AnimatedPressable>
  );
}

function Trailing({ children, ...rest }: PressableProps) {
  return (
    <AnimatedPressable {...rest} layout={LAYOUT_ANIMATION}>
      {children}
    </AnimatedPressable>
  );
}

const MemoizedLeading = React.memo(Leading);
const MemoizedTrailing = React.memo(Trailing);
(MemoizedLeading as any).__ITEM_TYPE__ = LEADING_TYPE;
(MemoizedTrailing as any).__ITEM_TYPE__ = TRAILING_TYPE;

interface ListProps extends PressableProps {
  children?: React.ReactNode;
  animate?: boolean;
  contentContainerStyle?: PressableProps["style"];
  isLast?: boolean;
}

const DEFAULT_CONTAINER_STYLE = Object.freeze({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  width: "100%" as const,
  paddingVertical: 12,
  paddingHorizontal: 16,
  gap: 16,
});

const DEFAULT_CONTENT_STYLE = Object.freeze({
  flexDirection: "column" as const,
  flex: 1,
});

function areEqual(prev: ListProps, next: ListProps) {
  // Quick reference equality check
  if (prev === next) return true;
  
  // Check non-children props
  const prevKeys = Object.keys(prev) as Array<keyof ListProps>;
  const nextKeys = Object.keys(next) as Array<keyof ListProps>;
  
  if (prevKeys.length !== nextKeys.length) return false;
  
  for (const key of prevKeys) {
    if (key === "children") continue;
    if (prev[key] !== next[key]) return false;
  }
  
  // Children comparison
  return prev.children === next.children;
}

const ItemComponent = React.forwardRef<typeof Pressable, ListProps>(function ItemComponent(
  {
    children,
    contentContainerStyle,
    style,
    animate,
    onPressIn,
    onPressOut,
    isLast = false,
    ...rest
  },
  ref
) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isAnimatingRef = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const handlePressIn = useCallback((event: any) => {
    'worklet';
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    if(!rest.onPress) {
      // If no onPress handler, prevent default behavior
      event.preventDefault();
      return;
    }
    
    scale.value = withTiming(0.97, { 
      duration: 100, 
      easing: Easing.out(Easing.exp) 
    });
    opacity.value = withTiming(0.7, { 
      duration: 50, 
      easing: Easing.out(Easing.exp) 
    });
    
    if (onPressIn) {
      runOnJS(onPressIn)(event);
    }
  }, [scale, opacity, onPressIn]);

  const handlePressOut = useCallback((event: any) => {
    'worklet';
    const resetAnimating = () => {
      isAnimatingRef.current = false;
    };
    
    scale.value = withSpring(1, { 
      mass: 1, 
      damping: 20, 
      stiffness: 300 
    }, () => {
      runOnJS(resetAnimating)();
    });
    opacity.value = withTiming(1, { 
      duration: 150, 
      easing: Easing.out(Easing.ease) 
    });
    
    if (onPressOut) {
      runOnJS(onPressOut)(event);
    }
  }, [scale, opacity, onPressOut]);

  const sortedChildren = useMemo(() => {
    if (!children) return { leading: [], trailing: [], others: [] };
    
    const leading: React.ReactNode[] = [];
    const trailing: React.ReactNode[] = [];
    const others: React.ReactNode[] = [];
    
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const childType = (child.type as any)?.__ITEM_TYPE__;
        if (childType === LEADING_TYPE) {
          leading.push(child);
        } else if (childType === TRAILING_TYPE) {
          trailing.push(child);
        } else {
          others.push(child);
        }
      } else if (child != null) {
        others.push(child);
      }
    });
    
    return { leading, trailing, others };
  }, [children]);

  const borderStyle = useMemo(() => {
    if (isLast) return {};
    return {
      borderBottomWidth: 0.5,
      borderBottomColor: `${colors.text}25`, // 25 = 15% opacity in hex
    };
  }, [isLast, colors.text]);

  const containerStyle = useMemo(() => {
    return [DEFAULT_CONTAINER_STYLE, style, animatedStyle];
  }, [style, animatedStyle]);

  const contentStyle = useMemo(() => {
    return contentContainerStyle
      ? [DEFAULT_CONTENT_STYLE, contentContainerStyle]
      : DEFAULT_CONTENT_STYLE;
  }, [contentContainerStyle]);

  const hasLeading = sortedChildren.leading.length > 0;
  const hasTrailing = sortedChildren.trailing.length > 0;
  const hasOthers = sortedChildren.others.length > 0;

  return (
    <Reanimated.View
      layout={LAYOUT_ANIMATION}
      style={borderStyle}
      entering={animate ? PapillonAppearIn : undefined}
      exiting={animate ? PapillonAppearOut : undefined}
    >
      <AnimatedPressable
        {...rest}
        ref={ref as any}
        layout={LAYOUT_ANIMATION}
        style={containerStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {hasLeading && sortedChildren.leading}
        {hasOthers && (
          <Reanimated.View style={contentStyle as any}>
            {sortedChildren.others}
          </Reanimated.View>
        )}
        {hasTrailing && sortedChildren.trailing}
      </AnimatedPressable>
    </Reanimated.View>
  );
});

const Item = React.memo(ItemComponent, areEqual);
Item.displayName = "Item";

export default Item;
export { MemoizedLeading as Leading, MemoizedTrailing as Trailing };