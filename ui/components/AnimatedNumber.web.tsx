import React from "react";
import Typography, { TypographyProps } from "./Typography";

interface AnimatedNumberProps extends TypographyProps {
  distance?: number;
  duration?: number;
  dampingRatio?: number;
  disableMoveAnimation?: boolean;
}

/**
 * Stable Web implementation.
 *
 * The native version uses custom Reanimated entering/exiting worklets with
 * spring animations. Reanimated Web has stricter limitations for layout
 * entering/exiting animations, so the Web version renders the number directly.
 */
function AnimatedNumber({ children, ...rest }: AnimatedNumberProps) {
  return <Typography {...rest}>{children}</Typography>;
}

export default React.memo(AnimatedNumber);
