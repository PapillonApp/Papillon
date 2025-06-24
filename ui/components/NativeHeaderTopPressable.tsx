import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

interface NativeHeaderTopPressableProps {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  layout?: ((values: { current: unknown; next: unknown }) => object) | undefined;
}

export default function NativeHeaderTopPressable({ onPress, children, style, layout }: NativeHeaderTopPressableProps) {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { opacity.value = withTiming(0.4, { duration: 50 }); if (onPress) { onPress(); } }}
      onPressOut={() => { opacity.value = withTiming(1, { duration: 200 }); }}
      style={[{ flexDirection: "row", gap: 4, alignItems: "center" }, animatedStyle, style]}
      layout={layout ?? Animation(LinearTransition)}
    >
      {children}
    </AnimatedPressable>
  );
}
