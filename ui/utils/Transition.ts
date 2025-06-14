import { Easing, withTiming } from "react-native-reanimated";

export const PapillonZoomIn = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.1 }],
    },
    animations: {
      opacity: withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.3, 0.3, 0, 1),
      }),
      transform: [
        {
          scale: withTiming(1, {
            duration: 200,
            easing: Easing.bezier(0.3, 0.3, 0, 1),
          }),
        },
      ],
    },
  };
};

export const PapillonZoomOut = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    animations: {
      opacity: withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.3, 0.3, 0, 1),
      }),
      transform: [
        {
          scale: withTiming(0.1, {
            duration: 200,
            easing: Easing.bezier(0.3, 0.3, 0, 1),
          }),
        },
      ],
    },
  };
};
