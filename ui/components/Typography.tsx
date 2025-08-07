import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

import { screenOptions } from "@/utils/theme/ScreenOptions";

// Map to actual font family names loaded in assets/fonts
const FONT_FAMILIES = {
  regular: "regular",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
} as const;

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

// Pre-computed alignment styles to avoid object creation
const ALIGNMENT_STYLES = StyleSheet.create({
  left: { textAlign: "left" as const },
  center: { textAlign: "center" as const },
  right: { textAlign: "right" as const },
  justify: { textAlign: "justify" as const },
});

const WEIGHT_STYLES = StyleSheet.create({
  regular: { fontFamily: FONT_FAMILIES.regular },
  medium: { fontFamily: FONT_FAMILIES.medium },
  semibold: { fontFamily: FONT_FAMILIES.semibold },
  bold: { fontFamily: FONT_FAMILIES.bold },
});

// Static color values to avoid string concatenation
const STATIC_COLORS = {
  light: "#FFFFFF",
  danger: "#DC1400",
} as const;

type Variant = keyof typeof VARIANTS;
type Color = "primary" | "text" | "secondary" | "light" | "danger";
type Alignment = keyof typeof ALIGNMENT_STYLES;

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: Color | string;
  align?: Alignment;
  style?: TextStyle | TextStyle[];
  inline?: boolean;
  weight?: keyof typeof WEIGHT_STYLES;
}

// Cache for computed color styles per theme
const colorStyleCache = new WeakMap<Record<string, string>, Record<string, TextStyle>>();

// Cache for computed final styles
const styleCache = new Map<string, TextStyle>();

const getColorsStyles = (colors: Record<string, string>): Record<string, TextStyle> => {
  let cached = colorStyleCache.get(colors);
  if (!cached) {
    cached = {
      primary: { color: colors.primary },
      text: { color: colors.text },
      secondary: { color: colors.text + "80" },
      light: { color: STATIC_COLORS.light },
      danger: { color: STATIC_COLORS.danger },
    };
    colorStyleCache.set(colors, cached);
  }
  return cached;
};

const Typography: React.FC<TypographyProps> = React.memo(
  ({
    variant = "body1",
    color = "text",
    align = "left",
    inline = false,
    weight,
    style,
    ...rest
  }) => {
    const { colors } = useTheme();

    // Generate cache key for this specific combination
    const cacheKey = React.useMemo(() => {
      const hasCustomStyle = style != null;
      const isCustomColor = typeof color === "string" && !(color in STATIC_COLORS) &&
        !["primary", "text", "secondary"].includes(color);

      // Only cache if no custom styles or custom colors to avoid memory leaks
      if (!hasCustomStyle && !isCustomColor) {
        return `${variant}-${color}-${align}-${inline}-${colors.primary}-${colors.text}`;
      }
      return null;
    }, [variant, color, align, inline, colors.primary, colors.text, style]);

    const computedStyle = React.useMemo(() => {
      // Try cache first for common cases
      if (cacheKey) {
        const cached = styleCache.get(cacheKey);
        if (cached) { return cached; }
      }

      const colorStyles = getColorsStyles(colors);
      const variantStyle = VARIANTS[variant];
      const alignStyle = ALIGNMENT_STYLES[align];
      const weightStyle = WEIGHT_STYLES[weight] || null;

      const inlineStyle: TextStyle = inline ? (() => {
        let fontSize: number | undefined;
        if (style) {
          const flattened = Array.isArray(style) ? StyleSheet.flatten(style) : style;
          fontSize = flattened.fontSize;
        }
        return {
          lineHeight: fontSize ?? (variantStyle.fontSize ?? 1)
        };
      })() : {};

      let colorStyle: TextStyle;
      if (typeof color === "string" && color in colorStyles) {
        colorStyle = colorStyles[color as Color];
      } else if (typeof color === "string") {
        colorStyle = { color };
      } else {
        colorStyle = colorStyles.text;
      }

      let finalStyle: TextStyle;

      if (style) {
        // For custom styles, merge without caching to avoid memory leaks
        finalStyle = {
          ...variantStyle,
          ...alignStyle,
          ...colorStyle,
          ...weightStyle, // Ensure weightStyle is merged here
          ...(Array.isArray(style) ? StyleSheet.flatten(style) : style),
          ...inlineStyle,
        };
      } else {
        // For common cases without custom styles, use optimized merging
        finalStyle = {
          ...variantStyle,
          ...alignStyle,
          ...colorStyle,
          ...weightStyle, // Ensure weightStyle is merged here
          ...inlineStyle,
        };

        // Cache only common cases
        if (cacheKey) {
          styleCache.set(cacheKey, finalStyle);
        }
      }

      return finalStyle;
    }, [colors, variant, color, align, style, cacheKey]);

    return <Text {...rest} style={computedStyle} />;
  },
  // Custom comparison for even better performance
  (prevProps, nextProps) => {
    // Fast equality checks for most common props
    if (prevProps.variant !== nextProps.variant) { return false; }
    if (prevProps.color !== nextProps.color) { return false; }
    if (prevProps.align !== nextProps.align) { return false; }
    if (prevProps.children !== nextProps.children) { return false; }

    // Shallow comparison for style prop
    if (prevProps.style !== nextProps.style) {
      if (!prevProps.style && !nextProps.style) { return true; }
      if (!prevProps.style || !nextProps.style) { return false; }

      // For array styles, do shallow comparison
      if (Array.isArray(prevProps.style) && Array.isArray(nextProps.style)) {
        if (prevProps.style.length !== nextProps.style.length) { return false; }
        return prevProps.style.every((s, i) => s === (nextProps.style as TextStyle[])[i]);
      }

      // For object styles, reference equality is sufficient for performance
      return prevProps.style === nextProps.style;
    }

    // Check other TextProps that might affect rendering
    const textPropsToCheck: (keyof TextProps)[] = [
      'numberOfLines', 'ellipsizeMode', 'selectable', 'testID'
    ];

    return textPropsToCheck.every(prop => prevProps[prop] === nextProps[prop]);
  }
);

// Cache cleanup to prevent memory leaks
const MAX_CACHE_SIZE = 1000;
const cleanupCache = () => {
  if (styleCache.size > MAX_CACHE_SIZE) {
    // Keep only the most recently used half
    const entries = Array.from(styleCache.entries());
    styleCache.clear();
    // Re-add the second half (most recent)
    entries.slice(Math.floor(entries.length / 2)).forEach(([key, value]) => {
      styleCache.set(key, value);
    });
  }
};

// Cleanup cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupCache, 30000); // Every 30 seconds
}

Typography.displayName = "Typography";

export default Typography;