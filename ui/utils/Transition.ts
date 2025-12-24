import { Platform } from "react-native";
import { Easing, withSpring, withTiming } from "react-native-reanimated";

export const PapillonZoomIn = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.1 }],
    },
    animations: {
      opacity: withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.3, 0.3, 0, 1),
      }),
      transform: [
        {
          scale: withTiming(1, {
            duration: 300,
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
        duration: 300,
        easing: Easing.bezier(0.3, 0.3, 0, 1),
      }),
      transform: [
        {
          scale: withTiming(0.1, {
            duration: 300,
            easing: Easing.bezier(0.3, 0.3, 0, 1),
          }),
        },
      ],
    },
  };
};

export const PapillonAppearIn = () => {
  "worklet";
  return {
    initialValues: {
      opacity: Platform.OS === 'android' ? 1 : 0,
      transform: [{ scale: 0.9 }],
    },
    animations: {
      opacity: Platform.OS === 'android' ? 1 : withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.3, 0.3, 0, 1),
      }),
      transform: [
        {
          scale: withTiming(1, {
            duration: 300,
            easing: Easing.bezier(0.3, 0.3, 0, 1),
          }),
        },
      ],
    },
  };
};

export const PapillonAppearOut = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: Platform.OS === 'android' ? [] : [{ scale: 1 }],
    },
    animations: {
      opacity: withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.3, 0.3, 0, 1),
      }),
      transform: Platform.OS === 'android' ? [] : [
        {
          scale: withTiming(0.9, {
            duration: 300,
            easing: Easing.bezier(0.3, 0.3, 0, 1),
          }),
        },
      ],
    },
  };
};

export const PapillonSpringIn = () => {
  "worklet";
  return {
    initialValues: {
      opacity: Platform.OS === 'android' ? 1 : 0,
      transform: [{ scale: 0.8 }],
    },
    animations: {
      opacity: Platform.OS === 'android' ? 1 : withSpring(1, {
        duration: 200
      }),
      transform: [
        {
          scale: withSpring(1, {
            duration: 350,
            dampingRatio: 0.8
          }),
        },
      ],
    },
  };
};

export const PapillonSpringOut = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: Platform.OS === 'android' ? [] : [{ scale: 1 }],
    },
    animations: {
      opacity: withSpring(0, {
        duration: 200
      }),
      transform: Platform.OS === 'android' ? [] : [
        {
          scale: withSpring(0.8, {
            duration: 200
          }),
        },
      ],
    },
  };
};
