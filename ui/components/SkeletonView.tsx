import { Dimensions, View, ViewProps } from "react-native";
import Reanimated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import LinearGradient from "react-native-linear-gradient";

export interface SkeletonViewProps extends ViewProps {
}

const SkeletonView = (props: SkeletonViewProps) => {
  const { colors } = useTheme();

  const translationX = useSharedValue(-200);

  const window_width = Dimensions.get("window").width;

  useEffect(() => {
    translationX.value = withRepeat(
      withTiming(window_width, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, []);

  const skeletonTranslation = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: -200,
    bottom: 0,
    width: 200,
    transform: [{ translateX: translationX.value }],
  }));

  const AnimatedLinearGradient = useMemo(
    () => Reanimated.createAnimatedComponent(LinearGradient),
    [],
  );


  return (
    <View
      {...props}
      style={[{
        backgroundColor: colors.text + "10",
        overflow: "hidden",
      }, props.style]}
    >
      <AnimatedLinearGradient
        colors={[colors.text + "00", colors.text + "10", colors.text + "00"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={skeletonTranslation}
      />
    </View>
  );
};

export default SkeletonView;