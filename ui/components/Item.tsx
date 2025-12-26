import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef } from "react";
import { Pressable, PressableProps } from "react-native";
import Reanimated, { Easing, LinearTransition, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);
const LAYOUT_ANIMATION = Animation(LinearTransition, "list");

export const LEADING_TYPE = Symbol("Leading");
export const TRAILING_TYPE = Symbol("Trailing");

// Pre-computed style objects to avoid recreation
const LEADING_STYLE = Object.freeze({ layout: LAYOUT_ANIMATION });
const TRAILING_STYLE = Object.freeze({ layout: LAYOUT_ANIMATION });

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

// Extreme optimization: Pre-create memoized components
const MemoizedLeading = React.memo(Leading);
const MemoizedTrailing = React.memo(Trailing);
(MemoizedLeading as any).__ITEM_TYPE__ = LEADING_TYPE;
(MemoizedTrailing as any).__ITEM_TYPE__ = TRAILING_TYPE;

// Cache for theme-based border colors to avoid repeated calculations
const borderColorCache = new Map<string, string>();

interface ListProps extends PressableProps {
  children?: React.ReactNode;
  animate?: boolean;
  contentContainerStyle?: PressableProps["style"];
  isLast?: boolean;
  disablePadding?: boolean;
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
  gap: 2
});

// Optimized areEqual with early returns and minimal key checking
function areEqual(prev: ListProps, next: ListProps) {
  // Quick reference equality check
  if (prev === next) { return true; }

  // Check most likely to change props first
  if (prev.isLast !== next.isLast) { return false; }
  if (prev.animate !== next.animate) { return false; }
  if (prev.onPress !== next.onPress) { return false; }
  if (prev.onPressIn !== next.onPressIn) { return false; }
  if (prev.onPressOut !== next.onPressOut) { return false; }
  if (prev.style !== next.style) { return false; }
  if (prev.contentContainerStyle !== next.contentContainerStyle) { return false; }

  // Children comparison last (most expensive)
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
    disablePadding = false,
    ...rest
  },
  ref
) {
  const { colors } = useTheme();

  // Single shared value for performance - combine scale and opacity into one animation
  const animationValue = useSharedValue(0);
  const isAnimatingRef = useRef(false);

  // Pre-calculate if we have an onPress handler to avoid checks during animation
  const hasOnPress = Boolean(rest.onPress);

  const animatedStyle = useAnimatedStyle(() => {
    const progress = animationValue.value;
    return {
      transform: [{ scale: 1 - progress * 0.03 }], // 0.97 when progress = 1
      opacity: 1 - progress * 0.3, // 0.7 when progress = 1
    };
  }, []);

  const handlePressIn = useCallback((event: any) => {
    if (!hasOnPress) {
      event?.preventDefault?.();
      return;
    }

    // If animation is running, reset it before starting again
    if (isAnimatingRef.current) {
      animationValue.value = 0;
    }
    isAnimatingRef.current = true;
    animationValue.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.exp)
    });

    onPressIn?.(event);
  }, [animationValue, hasOnPress, onPressIn]);

  const setAnimatingFalse = () => { isAnimatingRef.current = false; };
  const handlePressOut = useCallback((event: any) => {
    // if (!isAnimatingRef.current) { return; }

    animationValue.value = withSpring(0, {
      mass: 1,
      damping: 15,
      stiffness: 300
    }, () => {
      'worklet';
      runOnJS(setAnimatingFalse)();
    });

    onPressOut?.(event);
  }, [animationValue, onPressOut]);

  // Extremely optimized children sorting with minimal allocations
  const sortedChildren = useMemo(() => {
    if (!children) { return null; }

    let leading: React.ReactNode[] | null = null;
    let trailing: React.ReactNode[] | null = null;
    let others: React.ReactNode[] | null = null;

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const childType = (child.type as any)?.__ITEM_TYPE__;
        if (childType === LEADING_TYPE) {
          if (!leading) { leading = []; }
          leading.push(child);
        } else if (childType === TRAILING_TYPE) {
          if (!trailing) { trailing = []; }
          trailing.push(child);
        } else {
          if (!others) { others = []; }
          others.push(child);
        }
      } else if (child != null) {
        if (!others) { others = []; }
        others.push(child);
      }
    });

    return { leading, trailing, others };
  }, [children]);

  // Pre-compute border color with caching to avoid string concatenation
  const borderColor = useMemo(() => {
    const colorKey = colors.text;
    let cached = borderColorCache.get(colorKey);
    if (!cached) {
      cached = `${colorKey}25`;
      borderColorCache.set(colorKey, cached);
    }
    return cached;
  }, [colors.text]);

  // Optimized style calculations with minimal object creation
  const borderStyle = useMemo(() =>
    isLast ? null : {
      borderBottomWidth: 0.5,
      borderBottomColor: borderColor,
    }
    , [isLast, borderColor]);

  const containerStyle = useMemo(() => {
    const baseStyle = [DEFAULT_CONTAINER_STYLE, animatedStyle];

    if (disablePadding) {
      baseStyle.push({ paddingVertical: 0, paddingHorizontal: 0 } as any);
    }

    if (style) {
      baseStyle.push(style as any);
    }

    return baseStyle;
  }, [style, animatedStyle, disablePadding]);

  const contentStyle = useMemo(() =>
    contentContainerStyle ? [DEFAULT_CONTENT_STYLE, contentContainerStyle] : DEFAULT_CONTENT_STYLE
    , [contentContainerStyle]);

  // Early return if no children to render
  if (!sortedChildren) {
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
        />
      </Reanimated.View>
    );
  }

  try {
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
          {sortedChildren.leading}
          {sortedChildren.others && (
            <Reanimated.View style={contentStyle as any}>
              {sortedChildren.others}
            </Reanimated.View>
          )}
          {sortedChildren.trailing}
        </AnimatedPressable>
      </Reanimated.View>
    );
  }
  catch (e) {
    return null;
  }
});

// Ultra-optimized Item component with aggressive memoization
const Item = React.memo(ItemComponent, areEqual);
Item.displayName = "Item";

// Pre-export memoized components to avoid recreation
export default Item;
export { MemoizedLeading as Leading, MemoizedTrailing as Trailing };