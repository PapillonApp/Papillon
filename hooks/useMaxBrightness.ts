import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import {setBrightnessAsync, getBrightnessAsync} from "expo-brightness"
import { warn } from "@/utils/logger/logger";

export function useMaxBrightness() {

  const previousBrightness = useRef<number | null>(null);

  useEffect(() => {
    const enableBrightness = async () => {
      try {
        if (previousBrightness.current === null) {
          previousBrightness.current = await getBrightnessAsync();
        }
        await setBrightnessAsync(1);
      } catch (error) {
        warn("Failed to set brightness:");
      }
    };

    const restoreBrightness = async () => {
      try {
        if (previousBrightness.current !== null) {
          await setBrightnessAsync(previousBrightness.current);
        }
      } catch (error) {
        warn("Failed to restore brightness:");
      }
    };

    enableBrightness();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background" ) {
        restoreBrightness();
      } else if (nextAppState === "active") {
        enableBrightness();
      }
    });

    return () => {
      subscription.remove();
      restoreBrightness();
    };
  }, []);
}
