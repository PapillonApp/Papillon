import React, { FC, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

type CircularProgressProps = {
  strokeWidth: number;
  radius: number;
  backgroundColor: string;
  fill: string;
  percentageComplete: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularProgress: FC<CircularProgressProps> = ({
  radius,
  strokeWidth,
  backgroundColor, 
  fill,
  percentageComplete,
}) => {
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  const strokeDashoffset = useSharedValue(circumference); // start at 0%

  useEffect(() => {
    const invertedCompletion = (100 - percentageComplete) / 100;
    strokeDashoffset.value = withTiming(circumference * invertedCompletion, {
      duration: 1500,
    });
  }, [percentageComplete]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return (
    <View style={[styles.container, { width: radius * 2, height: radius * 2 }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
