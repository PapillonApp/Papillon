
import React, { useRef, useMemo } from 'react';
import Typography, { TypographyProps } from './Typography';
import Reanimated, { LinearTransition, withDelay, withSpring } from 'react-native-reanimated';

interface AnimatedNumberProps extends TypographyProps {
  distance?: number; // Distance to translate the number
  duration?: number; // Duration of the animation
  disableMoveAnimation?: boolean; // Désactivé la transition linéaire
}

function AnimatedNumber({ children, distance = 16, duration = 300, disableMoveAnimation = false, ...rest }: AnimatedNumberProps) {
  try {
    // Convert children to string and split into digits
    const value = useMemo(() => (children?.toString ? children.toString().trim() : ''), [children]);
    const digits = useMemo(() => value.split(''), [value]);

    // Track previous digits
    const prevDigitsRef = useRef<string[]>(digits);
    React.useEffect(() => {
      prevDigitsRef.current = digits;
    }, [value]);

    // Memoize unchanged and changedIndex arrays
    const { unchangedArr, changedIndexArr } = useMemo(() => {
      const prevDigits = prevDigitsRef.current;
      const unchangedArr = digits.map((digit, idx) => prevDigits && prevDigits[idx] === digit);
      let changedCounter = 0;
      const changedIndexArr = unchangedArr.map((unchanged) => (unchanged ? -1 : changedCounter++));
      return { unchangedArr, changedIndexArr };
    }, [digits]);

    // Memoize animation configs
    const getNumberEntering = useMemo(() => {
      return (changedIndex: number, unchanged: boolean) => () => {
        'worklet';
        const delay = unchanged ? 0 : changedIndex * 60;
        return {
          initialValues: {
            opacity: 0,
            transform: [{ translateY: 0 - distance }, { scale: 0.4 }],
          },
          animations: {
            opacity: withDelay(delay, withSpring(1, { duration })),
            transform: [
              { translateY: withDelay(delay, withSpring(0, { duration })) },
              { scale: withDelay(delay, withSpring(1, { duration })) },
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
            opacity: withDelay(delay, withSpring(0, { duration })),
            transform: [
              { translateY: withDelay(delay, withSpring(distance, { duration })) },
              { scale: withDelay(delay, withSpring(0.4, { duration })) },
            ],
          },
        };
      };
    }, [distance, duration]);

    return (
      <Reanimated.View
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
            <Reanimated.View
              key={"animated-number-" + digit + (digit != "." ? "-" + index : "")}
              layout={LinearTransition.springify()}
              entering={getNumberEntering(changedIndex, unchanged)}
              exiting={getNumberExiting(changedIndex, unchanged)}
            >
              <Typography {...rest}>{digit}</Typography>
            </Reanimated.View>
          );
        })}
      </Reanimated.View>
    );
  }
  catch (error) {
    console.error("Error in AnimatedNumber:", error);
    return <Typography {...rest}>{children}</Typography>;
  }
}

export default React.memo(AnimatedNumber);