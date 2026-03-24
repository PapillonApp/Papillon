import { useTheme } from "@react-navigation/native";
import React from "react";
import { ViewStyle } from "react-native";

import Ripple from "./RippleEffect";
import Typography from "./Typography";

export default function Button({ label, onPress, disabled = false, variant = "primary", fullWidth = false, leading, trailing, gap = 10, height = 50, color }: { label: string; onPress: () => void; disabled?: boolean; variant?: "primary" | "secondary" | "outlined" | "ghost" | "text"; fullWidth?: boolean; leading?: React.ReactNode; trailing?: React.ReactNode, gap?: number, height?: number, color?: string }) {
  const theme = useTheme();
  const { colors } = theme;

  const ButtonVariants = {
    primary: {
      backgroundColor: disabled ? colors.text + "22" : (color ?? colors.primary),
    },
    secondary: {
      backgroundColor: color ? color + '18' : colors.text + "18",
    },
    outlined: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: disabled ? colors.text + "44" : color ?? colors.primary,
    },
    ghost: {
      backgroundColor: disabled ? colors.text + "22" : color ?? colors.primary + "22",
    },
    text: {
      backgroundColor: "transparent",
    }
  };

  const TextVariants = {
    primary: {
      variant: "title",
      color: "white"
    },
    secondary: {
      variant: "title",
      color: disabled ? "textSecondary" : color ?? "textPrimary"
    },
    outlined: {
      variant: "title",
      color: disabled ? "textSecondary" : color ?? "primary"
    },
    ghost: {
      variant: "title",
      color: disabled ? "textSecondary" : color ?? "primary"
    },
    text: {
      variant: "title",
      color: disabled ? "textSecondary" : color ?? "primary"
    }
  };

  const RippleVariants = {
    primary: {
      rippleColor: "#FFFFFF55",
    },
    secondary: {
      rippleColor: colors.text + "22",
    },
    outlined: {
      rippleColor: colors.primary + "55",
    },
    ghost: {
      rippleColor: colors.primary + "22",
    },
    text: {
      rippleColor: colors.primary + "22",
    }
  };

  return (
    <Ripple
      style={[
        ButtonVariants[variant] as ViewStyle,
        {
          paddingHorizontal: 20,
          height: height,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 500,
          gap: 10,
          width: fullWidth ? "100%" : "auto",
          flexDirection: "row",
          gap: gap,
          pointerEvents: disabled ? "none" : "auto"
        },
      ]}
      rippleColor={RippleVariants[variant].rippleColor}
      onTap={() => {
        requestAnimationFrame(() => {
          onPress();
        });
      }}
    >
      {leading}
      <Typography {...TextVariants[variant]}>{label}</Typography>
      {trailing}
    </Ripple>
  );
}