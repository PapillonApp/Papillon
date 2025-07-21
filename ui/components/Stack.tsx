import React from "react";
import { FlexAlignType, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

// Types pour la direction et l'alignement
type Direction = "vertical" | "horizontal";
type Alignment = "start" | "center" | "end";

interface StackProps extends ViewProps {
  direction?: Direction;
  gap?: number;
  padding?: number;
  margin?: number;
  vAlign?: Alignment;
  hAlign?: Alignment;
  inline?: boolean;
  backgroundColor?: string;
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
  padding = 0,
  margin = 0,
  vAlign = "start",
  hAlign = "start",
  inline = false,
  backgroundColor,
  radius = 0,
  style,
  children,
  ...rest
}) => {
  // Generate cache key for style optimization
  const cacheKey = React.useMemo(() =>
    `${direction}-${gap}-${padding}-${margin}-${vAlign}-${hAlign}-${inline}-${backgroundColor || ''}-${radius}`,
    [direction, gap, padding, margin, vAlign, hAlign, inline, backgroundColor, radius]
  );

  // Ultra-optimized style computation with caching
  const computedStyle = React.useMemo(() => {
    // Check cache first
    const cached = STYLE_CACHE.get(cacheKey);
    if (cached) return cached;

    // Use pre-computed base styles
    const baseStyle = direction === "vertical" ? COMMON_STYLES.vertical : COMMON_STYLES.horizontal;

    // Build style object with minimal allocations
    const dynamicStyle: ViewStyle = {
      gap,
      padding,
      margin,
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
      dynamicStyle.width = "auto";
      dynamicStyle.flex = 0;
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