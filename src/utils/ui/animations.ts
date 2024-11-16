import { Easing, withTiming } from "react-native-reanimated";

const animPapillon = (animation: any) => {
  if (!animation) return;

  return animation.springify().mass(1).damping(20).stiffness(300);
};

const EnteringDuration = 200;
const EnteringScale = 0.8;
const ExitingDuration = 150;
const ExitingScale = 0.9;

// Paramètres d'animation pour l'entrée du menu contextuel
const PapillonAnimSettings = {
  duration: EnteringDuration,
  easing: Easing.bezier(0, 0, 0, 1),
};

// Paramètres d'animation pour la sortie du menu contextuel
const PapillonAnimSettingsExit = {
  duration: ExitingDuration,
  easing: Easing.bezier(0, 0, 0, 1),
};

// Fonction d'animation pour l'entrée du menu contextuel
const PapillonContextEnter = () => {
  "worklet";
  const animations = {
    opacity: withTiming(1, PapillonAnimSettings),
    transform: [
      {
        scale: withTiming(1, PapillonAnimSettings),
      },
    ],
  };
  const initialValues = {
    opacity: 0,
    transform: [
      { scale: EnteringScale },
    ],
  };
  return {
    initialValues,
    animations,
  };
};

// Fonction d'animation pour la sortie du menu contextuel
const PapillonContextExit = () => {
  "worklet";
  const animations = {
    opacity: withTiming(0, PapillonAnimSettingsExit),
    transform: [
      { scale: withTiming(ExitingScale, PapillonAnimSettingsExit) },
    ],
  };
  const initialValues = {
    opacity: 1,
    transform: [{ scale: 1 }],
  };
  return {
    initialValues,
    animations,
  };
};

export {
  animPapillon,
  PapillonContextEnter,
  PapillonContextExit,
};