import React, { useMemo } from "react";
import Reanimated, { EntryExitAnimationFunction, LayoutAnimation, LinearTransition } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";

type DynamicProps = {
  children?: React.ReactNode;
  animated?: boolean;
  style?: React.CSSProperties;
  origin?: "left" | "right" | "top" | "bottom" | "center";
  layout?: LayoutAnimation;
  entering?: EntryExitAnimationFunction;
  exiting?: EntryExitAnimationFunction;
  key?: string;
};

// Pre-compute animations to avoid function calls on every render
const APPEAR_IN = PapillonAppearIn;
const APPEAR_OUT = PapillonAppearOut;

// Pre-compute animated layout to avoid conditional computation
const ANIMATED_LAYOUT = Animation(LinearTransition, "smooth");

// Base style object to avoid recreation
const BASE_STYLE = { flexDirection: "row" as const };

export const Dynamic = React.memo<DynamicProps>(({
  children,
  animated,
  style,
  origin = "center",
  layout = ANIMATED_LAYOUT,
  entering = APPEAR_IN,
  exiting = APPEAR_OUT,
  ...rest
}) => {
  // Memoize the computed style to prevent object recreation
  const computedStyle = useMemo(() => {
    if (!style) {
      return {
        ...BASE_STYLE,
        transformOrigin: origin,
      };
    }

    return {
      ...BASE_STYLE,
      ...style,
      transformOrigin: origin,
    };
  }, [style, origin]);

  // Memoize layout prop to avoid conditional evaluation on every render
  const layoutProp = useMemo(() =>
    animated ? layout && ANIMATED_LAYOUT : undefined,
    [animated]
  );

  return (
    <Reanimated.View
      entering={animated ? entering : undefined}
      exiting={animated ? exiting : undefined}
      layout={animated && (layout ?? layoutProp)}
      // @ts-expect-error - Reanimated types are not fully compatible with React Native types
      style={computedStyle}
      {...rest}
    >
      {children}
    </Reanimated.View>
  );
});