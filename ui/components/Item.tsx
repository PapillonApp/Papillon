import { Pressable, PressableProps } from "react-native";
import React, { useMemo, useCallback } from "react";
import Reanimated, { LinearTransition, useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from "react-native-reanimated";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

const LAYOUT_ANIMATION = LinearTransition
  .springify()
  .mass(1)
  .damping(20)
  .stiffness(300);

export const LEADING_TYPE = Symbol('Leading');
export const TRAILING_TYPE = Symbol('Trailing');

function Leading({ children, ...rest }: PressableProps) {
  return (
    <AnimatedPressable
      {...rest}
      layout={LAYOUT_ANIMATION}
    >
      {children}
    </AnimatedPressable>
  );
}

function Trailing({ children, ...rest }: PressableProps) {
  return (
    <AnimatedPressable
      {...rest}
      layout={LAYOUT_ANIMATION}
    >
      {children}
    </AnimatedPressable>
  );
}

// Mémoïser les composants
const MemoizedLeading = React.memo(Leading);
const MemoizedTrailing = React.memo(Trailing);

// Ajouter les symbols aux composants pour l'identification
(MemoizedLeading as any).__ITEM_TYPE__ = LEADING_TYPE;
(MemoizedTrailing as any).__ITEM_TYPE__ = TRAILING_TYPE;

interface ListProps extends PressableProps {
  children?: React.ReactNode;
  contentContainerStyle?: PressableProps['style'];
}

const DEFAULT_CONTAINER_STYLE = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  width: '100%' as const,
  paddingVertical: 12,
  paddingHorizontal: 16,
  gap: 16,
};

const DEFAULT_CONTENT_STYLE = {
  flexDirection: 'column' as const,
  flex: 1,
};

function ItemComponent({
  children,
  contentContainerStyle,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ListProps) {
  // Animation scale et opacity
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const handlePressIn = useCallback((event: any) => {
    "use worklet";
    scale.value = withTiming(0.97, { duration: 100, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(0.7, { duration: 50, easing: Easing.out(Easing.exp) });
    onPressIn?.(event);
  }, [scale, opacity, onPressIn]);

  const handlePressOut = useCallback((event: any) => {
    "use worklet";
    scale.value = withSpring(1, { mass: 1, damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    onPressOut?.(event);
  }, [scale, opacity, onPressOut]);

  // Optimisation : Fonction de tri des enfants optimisée
  const sortedChildren = useMemo(() => {
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

  // Optimisation : Styles mémoïsés plus efficaces
  const containerStyle = useMemo(() => {
    const baseStyle = style ? [DEFAULT_CONTAINER_STYLE, style] : DEFAULT_CONTAINER_STYLE;
    return [baseStyle, animatedStyle];
  }, [style, animatedStyle]);

  const contentStyle = useMemo(() => 
    contentContainerStyle ? [DEFAULT_CONTENT_STYLE, contentContainerStyle] : DEFAULT_CONTENT_STYLE,
    [contentContainerStyle]
  );

  return (
    <AnimatedPressable
      {...rest}
      layout={LAYOUT_ANIMATION}
      style={containerStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {sortedChildren.leading}
      <Reanimated.View style={contentStyle as any}>
        {sortedChildren.others}
      </Reanimated.View>
      {sortedChildren.trailing}
    </AnimatedPressable>
  );
}

// Mémoïser le composant Item
const Item = React.memo(ItemComponent);
Item.displayName = 'Item';

export default Item;
export { MemoizedLeading as Leading, MemoizedTrailing as Trailing };