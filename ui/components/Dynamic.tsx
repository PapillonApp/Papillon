import React from "react";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { Animation } from "../utils/Animation";

type DynamicProps = {
  children?: React.ReactNode;
  animated?: boolean;
  style?: React.CSSProperties;
  origin?: "left" | "right" | "top" | "bottom" | "center";
  key?: string | number;
};

export const Dynamic: React.FC<DynamicProps> = ({ children, animated, style, origin, ...rest }) => {
  return (
    <Reanimated.View
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      layout={animated ? Animation(LinearTransition) : undefined}
      // @ts-expect-error - Reanimated types are not fully compatible with React Native types
      style={{
        ...style,
        flexDirection: "row",
        transformOrigin: origin ? origin : "right",
      }}
      {...rest}
    >
      {children}
    </Reanimated.View>
  );
};