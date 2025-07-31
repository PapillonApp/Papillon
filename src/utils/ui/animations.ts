import { Easing, withTiming } from "react-native-reanimated";

const SPRING_CONFIG = { mass: 1, damping: 20, stiffness: 300 };
const TIMING_CONFIG = { duration: 300, easing: Easing.bezier(0.3, 0.3, 0, 1) };
const ENTER_CONFIG = {
  duration: 180,
  scaleX: 0.8,
  scaleY: 0.65,
  easing: Easing.bezier(0.3, 0.3, 0, 1),
};
const EXIT_CONFIG = {
  duration: 120,
  scaleX: 0.9,
  scaleY: 0.7,
  easing: Easing.bezier(0.3, 0.3, 0, 1),
};

const animPapillon = (a: any) =>
  a
    ?.springify()
    .mass(SPRING_CONFIG.mass)
    .damping(SPRING_CONFIG.damping)
    .stiffness(SPRING_CONFIG.stiffness);

const anim2Papillon = (a: any) =>
  a?.duration(TIMING_CONFIG.duration).easing(TIMING_CONFIG.easing);

const ENTER_TIMING = {
  duration: ENTER_CONFIG.duration,
  easing: ENTER_CONFIG.easing,
};
const EXIT_TIMING = {
  duration: EXIT_CONFIG.duration,
  easing: EXIT_CONFIG.easing,
};

const PapillonContextEnter = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [
        { scaleX: ENTER_CONFIG.scaleX },
        { scaleY: ENTER_CONFIG.scaleY },
      ],
    },
    animations: {
      opacity: withTiming(1, ENTER_TIMING),
      transform: [
        { scaleX: withTiming(1, ENTER_TIMING) },
        { scaleY: withTiming(1, ENTER_TIMING) },
      ],
    },
  };
};

const PapillonContextExit = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: [{ scaleX: 1 }, { scaleY: 1 }],
    },
    animations: {
      opacity: withTiming(0, EXIT_TIMING),
      transform: [
        { scaleX: withTiming(EXIT_CONFIG.scaleX, EXIT_TIMING) },
        { scaleY: withTiming(EXIT_CONFIG.scaleY, EXIT_TIMING) },
      ],
    },
  };
};

export {
  animPapillon,
  anim2Papillon,
  PapillonContextEnter,
  PapillonContextExit,
};
