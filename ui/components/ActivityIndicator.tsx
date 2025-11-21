import { useTheme } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { PapillonAppearIn, PapillonAppearOut } from '../utils/Transition';

interface ActivityIndicatorProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 42,
  color,
  strokeWidth: propStrokeWidth,
  style,
}) => {
  const theme = useTheme();
  const finalColor = color || theme.colors.primary;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1 // Infinite repeat
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  const strokeWidth = propStrokeWidth || Math.max(2, size * 0.12);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 75% filled means 0.75 * circumference is drawn, the rest is gap
  const strokeDasharray = [circumference * 0.75, circumference];

  return (
    <Animated.View
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
    >
      <Animated.View
        style={[
          { width: size, height: size, justifyContent: 'center', alignItems: 'center' },
          animatedStyle,
          style,
        ]}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={finalColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

export default ActivityIndicator;
