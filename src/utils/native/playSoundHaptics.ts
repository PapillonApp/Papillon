import { useThemeSoundHaptics } from "@/hooks/Theme_Sound_Haptics";
import { Sound } from "expo-av/build/Audio";
import * as Haptics from "expo-haptics";


const useSoundHapticsWrapper = () => {
  const { enableHaptics, enableSon } = useThemeSoundHaptics();

  const playHaptics = async (
    type: "impact" | "notification",
    // Objet pour éviter les erreurs TypeScript
    haptic: {
      impact?: Haptics.ImpactFeedbackStyle;
      notification?: Haptics.NotificationFeedbackType;
    }
  ) => {
    if (enableHaptics) {
      if (type === "impact") await Haptics.impactAsync(haptic.impact);
      else await Haptics.notificationAsync(haptic.notification);
    }
  };

  const playSound = async (srcSound: any) => {
    if (enableSon) {
      const { sound } = await Sound.createAsync(srcSound);
      await sound.playAsync();
    }
  };

  return { playHaptics, playSound };
};

export default useSoundHapticsWrapper;
