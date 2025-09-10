import { useTheme } from "@react-navigation/native";
import React from "react";
import { FlexAlignType, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

// Types pour la direction et l'alignement
type Direction = "vertical" | "horizontal";
type Alignment = "start" | "center" | "end";

interface StackProps extends ViewProps {
  direction?: Direction;
  gap?: number;
  padding?: number | [number, number];
  height?: number;
  width?: number | "100%" | "auto" | string;
  margin?: number;
  vAlign?: Alignment;
  hAlign?: Alignment;
  inline?: boolean;
  flex?: boolean;
  backgroundColor?: string;
  card?: boolean; // Utilisé pour les cartes
  flat?: boolean; // Utilisé pour les listes plates
  bordered?: boolean; // Utilisé pour les listes avec bordures
  radius?: number;
  style?: ViewStyle | ViewStyle[];
}

// Pre-computed alignment maps for maximum performance
const ALIGN_ITEMS_MAP: Record<Alignment, FlexAlignType> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
} as const;

const JUSTIFY_CONTENT_MAP: Record<Alignment, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
} as const;

// Pre-computed style cache to avoid object creation
const STYLE_CACHE = new Map<string, (ViewStyle | any)[]>();

// Cache cleanup to prevent memory leaks (runs when cache gets too large)
const MAX_CACHE_SIZE = 100;
const cleanupCache = () => {
  if (STYLE_CACHE.size > MAX_CACHE_SIZE) {
    const entries = Array.from(STYLE_CACHE.entries());
    STYLE_CACHE.clear();
    // Keep only the last 50 entries (most recently used)
    entries.slice(-50).forEach(([key, value]) => {
      STYLE_CACHE.set(key, value);
    });
  }
};

// Pre-computed common combinations
const COMMON_STYLES = StyleSheet.create({
  base: {
    width: "100%",
  },
  vertical: {
    width: "100%",
    flexDirection: "column",
  },
  horizontal: {
    width: "100%",
    flexDirection: "row",
  },
});

// Memoized Stack component for extreme performance
const Stack: React.FC<StackProps> = ({
  direction = "vertical",
  gap = 4,
  width,
  height,
  padding = 0,
  margin = 0,
  vAlign = "start",
  hAlign = "start",
  inline = false,
  flex = false,
  backgroundColor,
  radius = 0,
  card = false,
  flat = false,
  bordered = false,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const { colors } = theme;

  // Generate cache key for style optimization
  const cacheKey = React.useMemo(() =>
    `${direction}-${gap}-${width}--${height}-${padding}-${margin}-${vAlign}-${hAlign}-${inline}-${theme.dark}-${flex}-${backgroundColor || ''}-${radius}-${card}`,
    [direction, gap, width, height, padding, margin, vAlign, hAlign, inline, theme.dark, flex, backgroundColor, radius, card]
  );

  // Ultra-optimized style computation with caching
  const computedStyle = React.useMemo(() => {
    // Check cache first
    const cached = STYLE_CACHE.get(cacheKey);
    if (cached) { return cached; }

    // Use pre-computed base styles
    const baseStyle = direction === "vertical" ? COMMON_STYLES.vertical : COMMON_STYLES.horizontal;

    // Build style object with minimal allocations
    const dynamicStyle: ViewStyle = {
      gap,
      padding: !(padding instanceof Array) ? padding : undefined,
      paddingHorizontal: padding instanceof Array ? padding[0] : undefined,
      paddingVertical: padding instanceof Array ? padding[1] : undefined,
      margin,
      width: width,
      height: height,
      alignItems: ALIGN_ITEMS_MAP[hAlign],
      justifyContent: JUSTIFY_CONTENT_MAP[vAlign],
    };

    // Add conditional styles only if needed
    if (backgroundColor) {
      dynamicStyle.backgroundColor = backgroundColor;
    }

    if (radius > 0) {
      dynamicStyle.borderRadius = radius;
      dynamicStyle.borderCurve = "continuous";
    }

    // Handle inline with React Native compatible values
    if (inline) {
      dynamicStyle.alignSelf = "center";
      dynamicStyle.width = width !== undefined ? width : "auto";
      dynamicStyle.flex = flex ? 1 : 0;
    }

    if (card) {
      dynamicStyle.borderRadius = radius || 20;
      dynamicStyle.borderCurve = "continuous";
      dynamicStyle.shadowColor = flat ? "transparent" : "#000000";
      dynamicStyle.shadowOffset = { width: 0, height: 0 };
      dynamicStyle.shadowOpacity = flat ? 0 : 0.16;
      dynamicStyle.shadowRadius = 1.5;
      dynamicStyle.elevation = 1;
      dynamicStyle.overflow = "visible"; // Ensure shadows are visible
      dynamicStyle.borderColor = colors.text + "25";
      dynamicStyle.borderWidth = flat ? 1 : 0.5;
      dynamicStyle.backgroundColor = backgroundColor || colors.card; // Default to theme background
    }

    if (bordered) {
      dynamicStyle.borderRadius = radius || 20;
      dynamicStyle.borderCurve = "continuous";
      dynamicStyle.borderColor = colors.border + "33";
      dynamicStyle.borderWidth = 1;
      dynamicStyle.backgroundColor = backgroundColor || colors.card;
    }

    const finalStyle = [baseStyle, dynamicStyle];

    // Cache the result
    STYLE_CACHE.set(cacheKey, finalStyle);

    // Cleanup cache if necessary
    cleanupCache();

    return finalStyle;
  }, [cacheKey, direction, gap, padding, margin, hAlign, vAlign, backgroundColor, radius, inline]);

  return (
    <View {...rest} style={[computedStyle, style]}>
      {children}
    </View>
  );
};

// Set display name for debugging
Stack.displayName = 'Stack';

export default Stack;