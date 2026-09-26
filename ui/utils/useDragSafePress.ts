import { useCallback, useRef } from "react";
import type { GestureResponderEvent } from "react-native";

// A touch that travelled further than this between press-in and release was a
// scroll or a swipe, not a tap.
const PRESS_SLOP = 12;

type PressHandler = ((event: GestureResponderEvent) => void) | undefined;

/**
 * Wraps a touchable's `onPressIn`/`onPress` so a press that drifted is dropped.
 * Touchables inside a scroll view usually get their responder terminated when
 * scrolling starts, but that does not hold when the movement is claimed by a
 * gesture handler further up — such as the week pager — which is how a swipe
 * ends up opening whatever it started on.
 */
export function useDragSafePress(onPress: PressHandler, onPressIn?: PressHandler) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  const handlePressIn = useCallback((event: GestureResponderEvent) => {
    origin.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
    onPressIn?.(event);
  }, [onPressIn]);

  const handlePress = useCallback((event: GestureResponderEvent) => {
    const start = origin.current;
    origin.current = null;

    if (start) {
      const { pageX, pageY } = event.nativeEvent;
      if (Math.hypot(pageX - start.x, pageY - start.y) > PRESS_SLOP) {
        return;
      }
    }

    onPress?.(event);
  }, [onPress]);

  return { onPressIn: handlePressIn, onPress: handlePress };
}

export default useDragSafePress;
