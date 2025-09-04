import { Dimensions, View, ViewProps } from "react-native";
import Reanimated, { Easing, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";

export interface SkeletonViewProps extends ViewProps {}

const SkeletonView = (props: SkeletonViewProps) => {
  const { colors } = useTheme();

  const translationX = useSharedValue(-200);

  useEffect(() => {
    translationX.value = withRepeat(
      withTiming(Dimensions.get("window").width + 200, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [translationX]);

  const AnimatedLinearGradient = Reanimated.createAnimatedComponent(LinearGradient);

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
        style={{
          position: "absolute",
          top: -100,
          left: -200,
          bottom: 0,
          width: 200,
          transform: [{ translateX: translationX }],
        }}
      />
    </View>
  );
}

export default SkeletonView;