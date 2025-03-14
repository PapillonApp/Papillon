import { Easing, withTiming } from "react-native-reanimated";

const animPapillon = (animation: any) => {
  if (!animation) return;

  return animation.springify().mass(1).damping(20).stiffness(300);
};

const anim2Papillon = (animation: any) => {
  if (!animation) return;

  return animation.duration(300).easing(Easing.bezier(0.3, 0.3, 0, 1));
};

const EnteringDuration = 180;
const EnteringScaleX = 0.8;
const EnteringScaleY = 0.65;

const ExitingDuration = 120;
const ExitingScaleX = 0.9;
const ExitingScaleY = 0.7;

// Paramètres d'animation pour l'entrée du menu contextuel
const PapillonAnimSettings = {
  duration: EnteringDuration,
  easing: Easing.bezier(0.3, 0.3, 0, 1),
};

// Paramètres d'animation pour la sortie du menu contextuel
const PapillonAnimSettingsExit = {
  duration: ExitingDuration,
  easing: Easing.bezier(0.3, 0.3, 0, 1),
};

// Fonction d'animation pour l'entrée du menu contextuel
const PapillonContextEnter = () => {
  "worklet";
  const animations = {
    opacity: withTiming(1, PapillonAnimSettings),
    transform: [
      {
        scaleX: withTiming(1, PapillonAnimSettings),
      },
      {
        scaleY: withTiming(1, PapillonAnimSettings),
      },
    ],
  };
  const initialValues = {
    opacity: 0,
    transform: [
      { scaleX: EnteringScaleX },
      { scaleY: EnteringScaleY },
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
      { scaleX: withTiming(ExitingScaleX, PapillonAnimSettingsExit) },
      { scaleY: withTiming(ExitingScaleY, PapillonAnimSettingsExit) },
    ],
  };
  const initialValues = {
    opacity: 1,
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  };
  return {
    initialValues,
    animations,
  };
};

export {
  animPapillon,
  anim2Papillon,
  PapillonContextEnter,
  PapillonContextExit,
};
