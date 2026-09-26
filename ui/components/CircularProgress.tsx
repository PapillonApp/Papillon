import React, { FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from 'react-native-svg';

import {
  PapillonAppearIn,
  PapillonAppearOut,
  PapillonZoomIn,
  PapillonZoomOut,
} from "../utils/Transition";
import { SpringConfig } from "react-native-reanimated/src/animation/spring";
import { Papicons } from "@getpapillon/papicons";

type CircularProgressProps = {
  strokeWidth: number;
  radius: number;
  backgroundColor: string;
  fill: string;
  percentageComplete: number;
  showCheckmark?: boolean;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress: FC<CircularProgressProps> = ({
  radius,
  strokeWidth,
  backgroundColor,
  fill,
  percentageComplete,
  showCheckmark = false,
}) => {
  const percentageCompleteScaled = Math.max(percentageComplete, 0.05);

  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  const initialOffset = circumference * (1 - percentageCompleteScaled / 100);
  const strokeDashoffset = useSharedValue(initialOffset); // Initialize with correct value
  const strokeWidthValue = useSharedValue(strokeWidth);
  const innerRadiusValue = useSharedValue(innerRadius);

  const fastSpring: SpringConfig = {
    stiffness: 400,
    damping: 40,
  };
  const slowSpring: SpringConfig = {
    stiffness: 300,
    damping: 80,
  };

  useEffect(() => {
    const newOffset = circumference * (1 - percentageCompleteScaled / 100);
    strokeDashoffset.value = withSpring(newOffset, fastSpring);

    if (showCheckmark) {
      if (percentageCompleteScaled >= 100) {
        strokeWidthValue.value = withSpring(radius * 2, slowSpring);
        innerRadiusValue.value = withSpring(0.1, slowSpring);
      } else {
        strokeWidthValue.value = withSpring(strokeWidth, slowSpring);
        innerRadiusValue.value = withSpring(innerRadius, slowSpring);
      }
    }
  }, [percentageComplete, circumference, strokeDashoffset]); // Added dependencies to ensure proper updates

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.min(circumference - 0.01, strokeDashoffset.value),
    strokeWidth: strokeWidthValue.value,
    r: innerRadiusValue.value,
  }));

  return (
    <Animated.View
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      style={[styles.container, { width: radius * 2, height: radius * 2 }]}
      key={`circular-progress-${radius}`}
    >
      <Svg width={radius * 2} height={radius * 2}>
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          rotation={-90}
          origin={`${radius}, ${radius}`}
          cx={radius}
          cy={radius}
          stroke={fill}
          strokeLinecap="round"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
          fill="transparent"
        />
      </Svg>
      {percentageCompleteScaled >= 100 && showCheckmark && (
        <Animated.View
          entering={PapillonZoomIn}
          exiting={PapillonZoomOut}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Papicons
            name={"Check"}
            width={radius * 1.5}
            height={radius * 1.5}
            color={"#FFF"}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { CircularProgress };