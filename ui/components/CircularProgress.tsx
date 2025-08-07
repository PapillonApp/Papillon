import React, { FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { PapillonAppearIn, PapillonAppearOut } from '../utils/Transition';

type CircularProgressProps = {
  strokeWidth: number;
  radius: number;
  backgroundColor: string;
  fill: string;
  percentageComplete: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress: FC<CircularProgressProps> = ({
  radius,
  strokeWidth,
  backgroundColor,
  fill,
  percentageComplete,
}) => {
  // return (<></>);

  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  const initialOffset = circumference * (1 - percentageComplete / 100);
  const strokeDashoffset = useSharedValue(initialOffset); // Initialize with correct value

  useEffect(() => {
    const newOffset = circumference * (1 - percentageComplete / 100);
    strokeDashoffset.value = withTiming(newOffset, {
      duration: 500,
    });
  }, [percentageComplete, circumference, strokeDashoffset]); // Added dependencies to ensure proper updates

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
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
          r={innerRadius}
          stroke={fill}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
          fill="transparent"
        />
      </Svg>
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