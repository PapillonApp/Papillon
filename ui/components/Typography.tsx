import { screenOptions } from "@/utils/theme/ScreenOptions";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

// Map to actual font family names loaded in assets/fonts
const FONT_FAMILIES = {
  regular: "SNPro-Regular",
  medium: "SNPro-Medium",
  semibold: "SNPro-Semibold",
  bold: "SNPro-Bold",
};

const VARIANTS = StyleSheet.create({
  body1: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.medium,
    lineHeight: 24,
  },
  body2: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.semibold,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.regular,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 24,
  },
  title: {
    fontSize: 17,
    fontFamily: FONT_FAMILIES.semibold,
    lineHeight: 24,
  },
  navigation: {
    fontSize: screenOptions.headerTitleStyle.fontSize || 18,
    fontFamily: FONT_FAMILIES.semibold,
    lineHeight: 24,
  },
  h1: {
    fontSize: 32,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 34,
  },
  h3: {
    fontSize: 24,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 30,
  },
  h4: {
    fontSize: 20,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 26,
  },
  h5: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.semibold,
    lineHeight: 32,
  },
  h6: {
    fontSize: 17,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 32,
  },
});

type Variant = keyof typeof VARIANTS;
type Color = "primary" | "text" | "secondary" | "light" | "danger";
type Alignment = "left" | "center" | "right" | "justify";

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: Color | string;
  align?: Alignment;
  style?: TextStyle | TextStyle[];
}

const getColorsList = (colors: Record<string, string>) => ({
  primary: colors.primary,
  text: colors.text,
  secondary: colors.text + "80",
  light: "#FFFFFF",
  danger: "#DC1400",
});

const Typography: React.FC<TypographyProps> = React.memo(
  ({
    variant = "body1",
    color = "text",
    align = "left",
    style,
    ...rest
  }) => {
    const { colors } = useTheme();
    const colorsList = React.useMemo(() => getColorsList(colors), [colors]);

    let resolvedColor: string;
    if (typeof color === "string" && color in colorsList) {
      resolvedColor = colorsList[color as Color];
    } else if (typeof color === "string") {
      resolvedColor = color;
    } else {
      resolvedColor = colors.text;
    }

    // Flatten style for efficiency
    const flatStyle = StyleSheet.flatten([
      { color: resolvedColor },
      { textAlign: align },
      VARIANTS[variant],
      style,
    ]);

    return <Text {...rest} style={flatStyle} />;
  }
);

Typography.displayName = "Typography";

export default Typography;