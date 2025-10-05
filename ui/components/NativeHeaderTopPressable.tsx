import React, { useCallback } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Reanimated, { LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { Animation } from "@/ui/utils/Animation";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

interface NativeHeaderTopPressableProps {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  layout?: ((values: { current: unknown; next: unknown }) => object) | undefined;
  disabled?: boolean;
  testID?: string;
}

const baseStyle: ViewStyle = { flexDirection: "row", gap: 4, alignItems: "center" };

const NativeHeaderTopPressable = React.memo(function NativeHeaderTopPressable({
  onPress,
  children,
  style,
  layout,
  disabled = false,
  testID,
}: NativeHeaderTopPressableProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), []);

  const handlePressIn = useCallback(() => {
    if (opacity.value !== 0.4) {
      opacity.value = withTiming(0.4, { duration: 50 });
    }
  }, [opacity]);

  const handlePressOut = useCallback(() => {
    if (opacity.value !== 1) {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [opacity]);

  const handlePress = useCallback(() => {
    if (onPress) { onPress(); }
  }, [onPress]);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[baseStyle, animatedStyle, style]}
      layout={layout ?? Animation(LinearTransition)}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      hitSlop={32}
    >
      {children}
    </AnimatedPressable>
  );
});

export default NativeHeaderTopPressable;
