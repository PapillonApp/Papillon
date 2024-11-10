import {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  type SharedValue,
} from "react-native-reanimated";
import type { EdgeInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT_FACTOR = 1.5;
const CORNER_RADIUS_FACTOR = 4;
const OVER_HEADER_HEIGHT_FACTOR = 2;

const stylezAnim = (translationY: SharedValue<number>, headerHeight: number) => useAnimatedStyle(() => {
  const opacity = interpolate(
    translationY.value,
    [10, 240],
    [1, 0],
    Extrapolate.CLAMP
  );

  const translateY = interpolate(
    translationY.value,
    [0 - headerHeight, 0, headerHeight],
    [(0 - headerHeight) / HEADER_HEIGHT_FACTOR, 0, headerHeight / 1.5],
    Extrapolate.CLAMP
  );

  return {
    transform: [{ translateY }],
    opacity,
  };
});

const overHeaderAnimAnim = (translationY: SharedValue<number>, headerHeight: number) => useAnimatedStyle(() => {
  const opacity = interpolate(
    translationY.value,
    [headerHeight - 48, headerHeight],
    [0, 1],
    Extrapolate.CLAMP
  );

  const translateY = interpolate(
    translationY.value,
    [headerHeight - 48, headerHeight],
    [48, 0],
    Extrapolate.CLAMP
  );

  return {
    opacity,
    transform: [{ translateY }],
  };
});

const cardStyleAnim = (translationY: SharedValue<number>, headerHeight: number) => useAnimatedStyle(() => {
  const scale = interpolate(
    translationY.value,
    [0, headerHeight / 3, headerHeight],
    [1, 0.94, 1],
    Extrapolate.CLAMP
  );

  return {
    transform: [{ scale }],
  };
});

const cornerStyleAnim = (translationY: SharedValue<number>, headerHeight: number, corners: number) => useAnimatedStyle(() => {
  const animatedCorners = interpolate(
    translationY.value,
    [100, headerHeight - 1, headerHeight],
    [14, corners, 0],
    Extrapolate.CLAMP
  );

  return {
    borderTopLeftRadius: animatedCorners,
    borderTopRightRadius: animatedCorners,
  };
});

const backdropStyleAnim = (translationY: SharedValue<number>, headerHeight: number) => useAnimatedStyle(() => {
  const opacity = interpolate(
    translationY.value,
    [headerHeight - 180, headerHeight],
    [0, 0.6],
    Extrapolate.CLAMP
  );

  return {
    opacity,
  };
});

const paddingTopItemStyleAnim = (translationY: SharedValue<number>, insets: EdgeInsets, headerHeight: number, overHeaderHeight: number) => useAnimatedStyle(() => {
  const paddingTop = interpolate(
    translationY.value,
    [1, headerHeight],
    [20, insets.top + overHeaderHeight],
    Extrapolate.CLAMP
  );

  return {
    paddingTop,
  };
});

const accountSwitcherAnim = (translationY: SharedValue<number>, insets: EdgeInsets, headerHeight: number) => useAnimatedStyle(() => {
  const top = interpolate(
    translationY.value,
    [0, headerHeight],
    [0, 0 - insets.top * OVER_HEADER_HEIGHT_FACTOR],
    Extrapolate.CLAMP
  );

  const opacity = interpolate(
    translationY.value,
    [0, headerHeight / 1.5],
    [1, 0],
    Extrapolate.CLAMP
  );

  return {
    top,
    opacity,
  };
});

export {
  stylezAnim,
  overHeaderAnimAnim,
  cardStyleAnim,
  cornerStyleAnim,
  backdropStyleAnim,
  paddingTopItemStyleAnim,
  accountSwitcherAnim,
};
