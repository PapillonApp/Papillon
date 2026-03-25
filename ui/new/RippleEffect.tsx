import React from 'react';
import { InteractionManager, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface RippleProps {
  style?: ViewStyle;
  onTap?: () => void;
  rippleColor?: string;
  pressScale?: number; // Target scale (e.g., 0.9)
  scaleDuration?: number; // How fast the view shrinks/grows
  children: React.ReactNode;
}

const Ripple: React.FC<RippleProps> = ({
  style,
  onTap,
  rippleColor = 'rgba(0,0,0,0.1)',
  pressScale = 0.96,
  scaleDuration = 100,
  children
}) => {
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const scale = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const rippleOpacity = useSharedValue(1);

  // Independent scale for the container
  const containerScale = useSharedValue(1);

  const handleTap = () => {
    // InteractionManager ensures the JS thread is clear 
    // and animations have finished before navigating
    InteractionManager.runAfterInteractions(() => {
      onTap?.();
    });
  };

  const gesture = Gesture.Tap()
    .onBegin((event) => {
      // 1. Position and Start Ripple
      centerX.value = event.x;
      centerY.value = event.y;
      rippleOpacity.value = 1;
      scale.value = 0;
      scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) });

      // 2. Shrink the entire view independently
      containerScale.value = withTiming(pressScale, { duration: scaleDuration / 2 });
    })
    .onEnd(() => {
      runOnJS(handleTap)();
    })
    .onTouchesCancelled(() => {
      rippleOpacity.value = withTiming(0, { duration: 700 });
      containerScale.value = withSpring(1, { duration: scaleDuration * 5, dampingRatio: 0.4 });
    })
    .onFinalize(() => {
      // 3. Reset everything
      rippleOpacity.value = withTiming(0, { duration: 700 });
      containerScale.value = withSpring(1, { duration: scaleDuration * 5, dampingRatio: 0.4 });
    });

  const rStyle = useAnimatedStyle(() => {
    const circleRadius = Math.sqrt(width.value ** 2 + height.value ** 2);
    return {
      width: circleRadius * 2,
      height: circleRadius * 2,
      borderRadius: circleRadius,
      opacity: rippleOpacity.value,
      backgroundColor: rippleColor,
      position: 'absolute',
      top: 0,
      left: 0,
      transform: [
        { translateX: centerX.value - circleRadius },
        { translateY: centerY.value - circleRadius },
        { scale: scale.value },
      ],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={(e) => {
          width.value = e.nativeEvent.layout.width;
          height.value = e.nativeEvent.layout.height;
        }}
        style={[style, containerAnimatedStyle, { overflow: 'hidden' }]}
      >
        {children}
        <Animated.View style={rStyle} />
      </Animated.View>
    </GestureDetector>
  );
};

export default Ripple;