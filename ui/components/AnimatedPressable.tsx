import React from "react";
import { Platform, Pressable, PressableProps } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as ExpoHaptics from "expo-haptics";

const ReanimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  scaleTo?: number;
  opacityTo?: number;
  hapticFeedback?: ExpoHaptics.ImpactFeedbackStyle;
};

export default function AnimatedPressable({
  children,
  scaleTo = 0.95,
  opacityTo = 0.7,
  hapticFeedback,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: Platform.OS === 'android' ? 1 : opacity.value,
    };
  }, []);

  const pressIn = () => {
    if (hapticFeedback)
      ExpoHaptics.impactAsync(hapticFeedback)
    "worklet";
    scale.value = withSpring(scaleTo, { duration: 30 });
    opacity.value = withSpring(opacityTo, { duration: 30 });
  };

  const pressOut = () => {
    "worklet";
    scale.value = withSpring(1, { duration: 200 });
    opacity.value = withSpring(1, { duration: 200 });
  };

  return (
    <ReanimatedPressable
      {...props}
      style={[animatedStyle, props.style]}
      onPressIn={(e) => {
        pressIn(); // animation on UI thread
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressOut(); // animation on UI thread
        props.onPressOut?.(e);
      }}
    >
      {children}
    </ReanimatedPressable>
  );
}
