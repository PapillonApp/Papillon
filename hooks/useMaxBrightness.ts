import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import {setBrightnessAsync, getBrightnessAsync} from "expo-brightness"
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {

  const previousBrightness = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const enableBrightness = async () => {
      try {
        const current = await getBrightnessAsync();

        if (!isMounted) return;

        if (previousBrightness.current === null) {
          previousBrightness.current = current
        }
        await setBrightnessAsync(1);
      } catch (error) {
        warn("Failed to set brightness");
      }
    };

    const restoreBrightness = async () => {
      try {
        if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
        if (previousBrightness.current !== null) {
          await setBrightnessAsync(previousBrightness.current);
        }
      } catch (error) {
        warn("Failed to restore brightness");
      }
    };

    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        enableBrightness();
      }
    }, 100);

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background" ) {
        restoreBrightness();
      } else if (nextAppState === "active") {
        timeoutRef.current = setTimeout(() => {
          if (isMounted) enableBrightness();
        }, 100);
      }
    });

    return () => {
      isMounted = false;
      restoreBrightness();
      subscription.remove();
    };
  }, []);
}
