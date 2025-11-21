import React, { useCallback, useMemo, useRef } from "react";
import { Platform, Pressable, PressableProps } from "react-native";
import Reanimated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as ExpoHaptics from "expo-haptics";
import { Animation } from "../utils/Animation";

const ReanimatedPressable = Reanimated.createAnimatedComponent(Pressable);

const IS_ANDROID = Platform.OS === "android";
const SPRING_IN_CONFIG = { duration: 30 };
const SPRING_OUT_CONFIG = { duration: 200 };

type AnimatedPressableProps = PressableProps & {
  scaleTo?: number;
  opacityTo?: number;
  hapticFeedback?: ExpoHaptics.ImpactFeedbackStyle;
  animated?: boolean;
};

function AnimatedPressable({
  children,
  scaleTo = 0.95,
  opacityTo = 0.7,
  hapticFeedback,
  animated = false,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const pressInRef = useRef(onPressIn);
  const pressOutRef = useRef(onPressOut);
  pressInRef.current = onPressIn;
  pressOutRef.current = onPressOut;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: IS_ANDROID ? 1 : opacity.value,
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      if (hapticFeedback) {
        ExpoHaptics.impactAsync(hapticFeedback);
      }
      scale.value = withSpring(scaleTo, SPRING_IN_CONFIG);
      opacity.value = withSpring(opacityTo, SPRING_IN_CONFIG);
      pressInRef.current?.(e);
    },
    [hapticFeedback, scaleTo, opacityTo, scale, opacity]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, SPRING_OUT_CONFIG);
      opacity.value = withSpring(1, SPRING_OUT_CONFIG);
      pressOutRef.current?.(e);
    },
    [scale, opacity]
  );

  const layoutAnim = useMemo(
    () => (animated ? Animation(LinearTransition) : undefined),
    [animated]
  );

  return (
    <ReanimatedPressable
      {...props}
      layout={layoutAnim}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </ReanimatedPressable>
  );
}

export default React.memo(AnimatedPressable);