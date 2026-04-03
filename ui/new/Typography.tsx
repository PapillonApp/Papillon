import { useTheme } from "@react-navigation/native";
import React from "react";
import { Platform, Text } from "react-native";

const WEIGHTS = ["light", "regular", "medium", "semibold", "bold"];

const VARIANTS: Record<string, Record<string, string | number>> = {
  "h1": {
    fontFamily: WEIGHTS[4],
    fontSize: 34,
    lineHeight: "120%"
  },
  "h2": {
    fontFamily: WEIGHTS[4],
    fontSize: 28,
    lineHeight: "120%"
  },
  "h3": {
    fontFamily: WEIGHTS[4],
    fontSize: 24,
    lineHeight: "120%"
  },
  "h4": {
    fontFamily: WEIGHTS[4],
    fontSize: 21,
    lineHeight: "130%"
  },
  "h5": {
    fontFamily: WEIGHTS[4],
    fontSize: 19,
    lineHeight: "130%"
  },
  "title": {
    fontFamily: WEIGHTS[4],
    fontSize: Platform.OS === "android" ? 18 : 17,
    lineHeight: "130%"
  },
  "action": {
    fontFamily: WEIGHTS[2],
    fontSize: 17,
    lineHeight: "140%"
  },
  "body1": {
    fontFamily: Platform.OS === "android" ? WEIGHTS[3] : WEIGHTS[2],
    fontSize: 15,
    lineHeight: "140%"
  },
  "body2": {
    fontFamily: WEIGHTS[2],
    fontSize: 14,
    lineHeight: "140%"
  },
  "caption": {
    fontFamily: WEIGHTS[2],
    fontSize: 13,
    lineHeight: "140%",
    letterSpacing: 0.1
  }
};

const fixLineHeight = (style: Record<string, string | number>) => {
  if (!style) { return {}; }
  if (style.lineHeight && style.fontSize) {
    if (typeof style.lineHeight === "string" && style.lineHeight.endsWith("%")) {
      style.lineHeight = (parseFloat(style.lineHeight) / 100) * style.fontSize;
    }
  }
  return style;
};

const ALIGNMENTS: Record<string, string> = {
  "left": "left",
  "center": "center",
  "right": "right"
}

export default function Typography({ variant = "body1", color = "textPrimary", align = "left", weight, ...rest }: any) {
  const theme = useTheme();
  const { colors } = theme;

  const COLORS: Record<string, string> = {
    "textPrimary": colors.text,
    "textSecondary": colors.text + "88",
    "primary": colors.tint,
  }

  const variantStyle = fixLineHeight(variant in VARIANTS ? VARIANTS[variant] : VARIANTS["body1"]);
  const textColor = color in COLORS ? COLORS[color] : color;
  const textAlign = align in ALIGNMENTS ? ALIGNMENTS[align] : ALIGNMENTS["left"];
  const textWeight = weight ? weight : variantStyle.fontFamily;

  const style = [
    variantStyle,
    { color: textColor, textAlign, fontFamily: textWeight },
    fixLineHeight(rest?.style)
  ]

  return (
    <Text {...rest} style={style} />
  );
}