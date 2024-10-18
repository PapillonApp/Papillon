import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "@react-navigation/native";
import Reanimated, {
  LinearTransition,
  EntryExitAnimationFunction,
  ComplexAnimationBuilder
} from "react-native-reanimated";
import { Svg, Circle, G } from "react-native-svg";
import { animPapillon } from "@/utils/ui/animations";

interface PapillonSpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  entering?: EntryExitAnimationFunction | ComplexAnimationBuilder;
  exiting?: EntryExitAnimationFunction | ComplexAnimationBuilder;
  animated?: boolean;
}

const PapillonSpinner: React.FC<PapillonSpinnerProps> = ({
  size = 50,
  color = "#000000",
  strokeWidth = 4,
  style,
  entering,
  exiting,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue.current, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const spin = animatedValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Reanimated.View
      style={style}
      layout={animated ? animPapillon(LinearTransition) : undefined}
      entering={entering}
      exiting={exiting}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        </Svg>
      </Animated.View>
    </Reanimated.View>
  );
};

export default PapillonSpinner;
