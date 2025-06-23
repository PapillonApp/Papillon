import { Easing } from "react-native-reanimated";

const SPRING_CONFIG = { mass: 1, damping: 20, stiffness: 300 };

type AnimationStyle = "default" | "spring" | "list";

const PapillonSpring = (a: any) =>
  a
    ?.springify()
    .mass(SPRING_CONFIG.mass)
    .damping(SPRING_CONFIG.damping)
    .stiffness(SPRING_CONFIG.stiffness);

const PapillonList = (a: any) =>
  a?.duration(300).easing(Easing.out(Easing.exp));

export const Animation = (animation?: any, style?: AnimationStyle) => {
  switch (style) {
  case "spring":
    return PapillonSpring(animation);
  case "list":
    return PapillonList(animation);
  default:
    return PapillonSpring(animation);
  }
};
