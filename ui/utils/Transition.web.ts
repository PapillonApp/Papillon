import { Easing, withTiming } from "react-native-reanimated";

/** Web-safe entering/exiting animations: no springify(). */
const easing = Easing.bezier(0.3, 0.3, 0, 1);

export const PapillonZoomIn = () => {
  "worklet";
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.1 }] },
    animations: {
      opacity: withTiming(1, { duration: 300, easing }),
      transform: [{ scale: withTiming(1, { duration: 300, easing }) }],
    },
  };
};

export const PapillonZoomOut = () => {
  "worklet";
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, { duration: 300, easing }),
      transform: [{ scale: withTiming(0.1, { duration: 300, easing }) }],
    },
  };
};

export const PapillonAppearIn = () => {
  "worklet";
  return {
    initialValues: { opacity: 0.1, transform: [{ scale: 0.9 }] },
    animations: {
      opacity: withTiming(1, { duration: 300, easing }),
      transform: [{ scale: withTiming(1, { duration: 300, easing }) }],
    },
  };
};

export const PapillonAppearOut = () => {
  "worklet";
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, { duration: 300, easing }),
      transform: [{ scale: withTiming(0.9, { duration: 300, easing }) }],
    },
  };
};

export const PapillonSpringIn = PapillonZoomIn;
export const PapillonSpringOut = PapillonZoomOut;
export const PapillonAndroidMenuIn = PapillonZoomIn;
