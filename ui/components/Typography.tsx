import React from "react";
import { DimensionValue, StyleSheet, Text, TextProps, TextStyle, View, StyleProp } from "react-native";
import { useTheme } from "@react-navigation/native";
import { screenOptions } from "@/utils/theme/ScreenOptions";
import SkeletonView from "@/ui/components/SkeletonView";

const FONT_FAMILIES = {
  regular: "regular",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
} as const;

export const VARIANTS = StyleSheet.create({
  body1: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.medium,
    lineHeight: 20,
  },
  body2: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.semibold,
    lineHeight: 19,
  },
  caption: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.regular,
    lineHeight: 19,
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
    lineHeight: 22,
  },
  navigation: {
    fontSize: screenOptions.headerTitleStyle.fontSize || 18,
    fontFamily: FONT_FAMILIES.semibold,
    lineHeight: 24,
  },
  header: {
    fontSize: 19,
    fontFamily: FONT_FAMILIES.bold,
    letterSpacing: 0.08,
    lineHeight: 22,
  },
  h0: {
    fontSize: 44,
    fontFamily: FONT_FAMILIES.bold,
    lineHeight: 56,
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

const ALIGNMENT_STYLES = StyleSheet.create({
  left: { textAlign: "left" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
  justify: { textAlign: "justify" },
});

const WEIGHT_STYLES = StyleSheet.create({
  regular: { fontFamily: FONT_FAMILIES.regular },
  medium: { fontFamily: FONT_FAMILIES.medium },
  semibold: { fontFamily: FONT_FAMILIES.semibold },
  bold: { fontFamily: FONT_FAMILIES.bold },
});

const STATIC_COLORS = {
  light: "#FFFFFF",
  danger: "#DC1400",
} as const;

const FLEX_ALIGN_MAP = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  justify: "stretch",
} as const;

const ITALIC_STYLE = { transform: [{ skewX: "-13deg" }] };

export type Variant = keyof typeof VARIANTS;
type Color = "primary" | "text" | "secondary" | "light" | "danger";
type Alignment = keyof typeof ALIGNMENT_STYLES;

export interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: Color | string;
  align?: Alignment;
  style?: StyleProp<TextStyle>;
  inline?: boolean;
  nowrap?: boolean;
  weight?: keyof typeof WEIGHT_STYLES;
  skeleton?: boolean;
  skeletonLines?: number;
  skeletonWidth?: DimensionValue;
  italic?: boolean;
}

const arePropsEqual = (prev: TypographyProps, next: TypographyProps) => {
  if (prev.children !== next.children) return false;
  if (prev.variant !== next.variant) return false;
  if (prev.color !== next.color) return false;
  if (prev.align !== next.align) return false;
  if (prev.weight !== next.weight) return false;
  if (prev.italic !== next.italic) return false;
  if (prev.inline !== next.inline) return false;
  if (prev.nowrap !== next.nowrap) return false;
  if (prev.skeleton !== next.skeleton) return false;

  if (prev.style === next.style) return true;

  if (Array.isArray(prev.style) && Array.isArray(next.style)) {
    if (prev.style.length !== next.style.length) return false;
    for (let i = 0; i < prev.style.length; i++) {
      if (prev.style[i] !== next.style[i]) return false;
    }
    return true;
  }

  return false;
};

const Typography = React.memo(({
  variant = "body1",
  color = "text",
  align = "left",
  inline = false,
  nowrap = false,
  weight,
  style,
  skeleton = false,
  skeletonLines = 1,
  skeletonWidth,
  italic = false,
  children,
  ...rest
}: TypographyProps) => {
  const { colors } = useTheme();

  if (skeleton) {
    const variantStyles = VARIANTS[variant];
    const fontSize = variantStyles.fontSize;
    const lineHeight = variantStyles.lineHeight;
    const spacer = (lineHeight - fontSize) / 2;

    const skeletons = [];
    for (let i = 0; i < skeletonLines; i++) {
      let width: DimensionValue = "100%";
      if (skeletonWidth !== undefined) {
        if (typeof skeletonWidth === "number") {
          width = skeletonWidth * (1 - (i / 5));
        } else if (typeof skeletonWidth === "string" && skeletonWidth.endsWith("%")) {
          const val = parseFloat(skeletonWidth);
          width = `${val * (1 - (i / 5))}%`;
        }
      } else if (typeof children === "string") {
        width = `${(children.length * 2) * (1 - (i / 5))}%`;
      }

      skeletons.push(
        <SkeletonView
          key={i}
          style={{
            width,
            minWidth: 50,
            height: fontSize,
            borderRadius: 4,
            marginTop: spacer,
            marginBottom: spacer,
          }}
        />
      );
    }

    return (
      <View
        style={[
          style,
          { flexDirection: "column", alignItems: FLEX_ALIGN_MAP[align] }
        ]}
        {...rest}
      >
        {skeletons}
      </View>
    );
  }

  const textColor =
    color === "primary" ? colors.primary :
      color === "text" ? colors.text :
        color === "secondary" ? colors.text :
          color === "light" ? STATIC_COLORS.light :
            color === "danger" ? STATIC_COLORS.danger :
              color;

  const secondaryOpacity = color === "secondary" ? { opacity: 0.5 } : undefined;

  const combinedStyle = [
    VARIANTS[variant],
    ALIGNMENT_STYLES[align],
    { color: textColor },
    secondaryOpacity,
    weight && WEIGHT_STYLES[weight],
    italic && ITALIC_STYLE,
    style
  ];

  return (
    <Text
      {...rest}
      style={combinedStyle}
      numberOfLines={nowrap ? 1 : rest.numberOfLines}
    >
      {children}
    </Text>
  );
}, arePropsEqual);

Typography.displayName = "Typography";

export default Typography;