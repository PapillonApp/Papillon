import React, { useRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const ReanimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & { style?: any };

const AnimatedPressable = React.forwardRef<View, AnimatedPressableProps>(
  ({ style, onPressIn, onPressOut, onPress, ...rest }, ref) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const isInside = useRef(false);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePressIn: PressableProps['onPressIn'] = (e) => {
      isInside.current = true;
      scale.value = withTiming(0.96, { duration: 50 });
      opacity.value = withTiming(0.7, { duration: 50 });
      onPressIn?.(e);
    };

    const handlePressOut: PressableProps['onPressOut'] = (e) => {
      // If the touch left the bounds, don't trigger press
      if (!isInside.current) {
        scale.value = withSpring(1, { duration: 200 });
        opacity.value = withTiming(1, { duration: 100 });
        onPressOut?.(e);
        return;
      }

      scale.value = withSpring(1, { duration: 350 });
      opacity.value = withTiming(1, { duration: 100 }, (finished) => {
        if (finished && isInside.current && onPress) {
          // @ts-expect-error : onPress et onPressOut renvoient un callback différent -> crash
          runOnJS(onPress)();
        }
      });
      onPressOut?.(e);
    };

    const handleMove = (e: any) => {
      const { locationX, locationY } = e.nativeEvent;
      if (
        locationX < 0 ||
        locationY < 0 ||
        locationX > e.currentTarget.clientWidth ||
        locationY > e.currentTarget.clientHeight
      ) {
        isInside.current = false; // finger moved outside
      } else {
        isInside.current = true; // finger moved back in
      }
    };

    return (
      <ReanimatedPressable
        ref={ref}
        {...rest}
        style={[style, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onTouchMove={handleMove} // track finger sliding
        onPress={() => { }} // disable default
      />
    );
  }
);

export default AnimatedPressable;
