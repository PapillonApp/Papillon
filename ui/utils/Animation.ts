const SPRING_CONFIG = { mass: 1, damping: 20, stiffness: 300 };

type AnimationStyle = "default" | "spring";

const PapillonSpring = (a: any) =>
  a
    ?.springify()
    .mass(SPRING_CONFIG.mass)
    .damping(SPRING_CONFIG.damping)
    .stiffness(SPRING_CONFIG.stiffness);

export const Animation = (animation?: any, style?: AnimationStyle) => {
  switch (style) {
    case "spring":
      return PapillonSpring(animation);
    default:
      return PapillonSpring(animation);
  }
};
