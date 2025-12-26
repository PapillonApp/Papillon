import React, { useRef, useMemo } from 'react';
import Typography, { TypographyProps } from './Typography';
import Reanimated, { LinearTransition, withDelay, withSpring, AnimateProps } from 'react-native-reanimated';

interface AnimatedNumberProps extends TypographyProps {
  distance?: number; // Distance to translate the number
  duration?: number; // Duration of the animation
  dampingRatio?: number; // Damping ratio of the animation
  disableMoveAnimation?: boolean; // Désactivé la transition linéaire
}

// Type the outer Reanimated component for better type safety
const AnimatedView = Reanimated.View as React.ComponentType<AnimateProps<React.ComponentProps<typeof Reanimated.View>>>;

function AnimatedNumber({
  children,
  distance = 12,
  duration = 700,
  dampingRatio = 0.55,
  disableMoveAnimation = false,
  ...rest
}: AnimatedNumberProps) {
  try {
    // 1. Memoize value string and digits array
    const value = useMemo(() => (children?.toString ? children.toString().trim() : ''), [children]);
    const digits = useMemo(() => value.split(''), [value]);

    // 2. Track previous digits for comparison
    const prevDigitsRef = useRef<string[]>(digits);
    React.useEffect(() => {
      // Update the previous digits AFTER the current render cycle is complete
      prevDigitsRef.current = digits;
    }, [value]);

    // 3. Memoize comparison arrays - Runs only when `digits` changes
    const { unchangedArr, changedIndexArr } = useMemo(() => {
      const prevDigits = prevDigitsRef.current;
      const unchangedArr: boolean[] = [];
      const changedIndexArr: number[] = [];
      let changedCounter = 0;

      // Use a standard loop for potential slight performance gain over .map()
      for (let idx = 0; idx < digits.length; idx++) {
        const isUnchanged = prevDigits[idx] === digits[idx];
        unchangedArr.push(isUnchanged);
        changedIndexArr.push(isUnchanged ? -1 : changedCounter++);
      }

      return { unchangedArr, changedIndexArr };
    }, [digits]);

    // 4. Memoize animation configs (factory functions) - Runs only if distance or duration changes
    const getNumberEntering = useMemo(() => {
      return (changedIndex: number, unchanged: boolean) => () => {
        'worklet';
        // Delay applied only if the digit actually changed
        const delay = unchanged ? 60 : changedIndex * 60;
        return {
          initialValues: {
            opacity: 0,
            transform: [{ translateY: distance }, { scale: 0.4 }],
          },
          animations: {
            opacity: withDelay(delay, withSpring(1, { duration: duration / 2 })),
            transform: [
              { translateY: withDelay(delay, withSpring(0, { duration, dampingRatio })) },
              { scale: withDelay(delay, withSpring(1, { duration, dampingRatio })) },
            ],
          },
        };
      };
    }, [distance, duration]);

    const getNumberExiting = useMemo(() => {

      return (changedIndex: number, unchanged: boolean) => () => {
        'worklet';
        const delay = unchanged ? 0 : changedIndex * 60;
        return {
          initialValues: {
            opacity: 1,
            transform: [{ translateY: 0 }, { scale: 1 }],
          },
          animations: {
            opacity: withDelay(delay, withSpring(0, { duration, dampingRatio })),
            transform: [
              { translateY: withDelay(delay, withSpring(-distance, { duration, dampingRatio })) }, // Use -distance for upward exit
              { scale: withDelay(delay, withSpring(0.5, { duration, dampingRatio })) },
            ],
          },
        };
      };
    }, [distance, duration]);

    return (
      <AnimatedView
        // Parent view layout for digit count/position changes
        layout={disableMoveAnimation ? undefined : LinearTransition.springify()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {digits.map((digit, index) => {
          const unchanged = unchangedArr[index];
          const changedIndex = changedIndexArr[index];

          return (
            <AnimatedView
              // Use digit and index in the key to ensure React/Reanimated sees a change 
              // when the value or position of a digit changes
              key={`animated-number-${digit}-${index}`}
              // **Optimization:** Removed inner 'layout' prop to rely only on controlled entering/exiting
              layout={(digit == "." || digit == ",") ? LinearTransition.springify() : undefined}
              entering={getNumberEntering(changedIndex, unchanged)}
              exiting={getNumberExiting(changedIndex, unchanged)}
            >
              <Typography {...rest}>{digit}</Typography>
            </AnimatedView>
          );
        })}
      </AnimatedView>
    );
  }
  catch (error) {
    // Keep error handling robust
    console.error("Error in AnimatedNumber:", error);
    return <Typography {...rest}>{children}</Typography>;
  }
}

// Keep the outer memoization
export default React.memo(AnimatedNumber);