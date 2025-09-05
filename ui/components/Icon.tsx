import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { View, ViewProps } from "react-native";

import { LEADING_TYPE } from "./Item";
import SkeletonView from "@/ui/components/SkeletonView";

interface IconProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
  opacity?: number;
  size?: number;
  papicon?: boolean;
  fill?: string;
  skeleton?: boolean;
}

// Pre-computed frozen style objects for maximum performance
const COLORED_ICON_STYLE = Object.freeze({
  padding: 4,
  borderRadius: 8,
  borderCurve: "continuous" as const,
  marginRight: -4,
});

const EMPTY_STYLE = Object.freeze({});

// Color cache to avoid repeated computations
const colorCache = new Map<string, { backgroundColor: string; childColor: string }>();
const WHITE_COLOR = "#ffffff";

// Optimized child enhancement function using direct array operations
const enhanceChildrenOptimized = (
  children: React.ReactNode,
  childColor: string,
  size: number,
  papicon?: boolean,
  fill?: string
): React.ReactNode => {
  if (!children) { return children; }

  // Helper to merge width/height/size
  const injectProps = (child: React.ReactElement<any>) => {
    const childProps = child.props;
    // Don't override explicit color/width/height/size
    const injected: any = {};
    const effectiveColor = fill !== undefined ? fill : childColor;
    if (papicon) {
      if (childProps.fill === undefined) injected.fill = effectiveColor;
    } else {
      if (childProps.color === undefined) injected.color = effectiveColor;
    }
    if (childProps.size === undefined) injected.size = size;
    if (childProps.width === undefined) injected.width = size;
    if (childProps.height === undefined) injected.height = size;
    return Object.keys(injected).length > 0 ? React.cloneElement(child, injected) : child;
  };

  // Fast path for single child (most common case)
  if (React.isValidElement(children)) {
    return injectProps(children as React.ReactElement<any>);
  }
  // Batch processing for multiple children
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return injectProps(child as React.ReactElement<any>);
    }
    return child;
  });
};

const Icon = React.memo<IconProps>(({
  children,
  color,
  opacity,
  style,
  size = 24,
  papicon,
  fill,
  skeleton = false,
  ...rest
}) => {
  const { colors } = useTheme();

  if (skeleton)
    return <SkeletonView
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.5,
      }}
    />

  // Ultra-fast memoization with optimized dependencies
  const { containerStyle, childColor, enhancedChildren } = useMemo(() => {
    const hasColor = Boolean(color);
    const currentChildColor = hasColor ? WHITE_COLOR : colors.text;

    // Use cache for color computations
    let colorData = colorCache.get(`${color || 'none'}-${colors.text}`);
    if (!colorData) {
      colorData = {
        backgroundColor: color || '',
        childColor: currentChildColor
      };
      // Limit cache size to prevent memory leaks
      if (colorCache.size > 100) {
        const firstKey = colorCache.keys().next().value;
        if (firstKey) {
          colorCache.delete(firstKey);
        }
      }
      colorCache.set(`${color || 'none'}-${colors.text}`, colorData);
    }

    // Add opacity to the container style if provided
    const opacityStyle = opacity !== undefined ? { opacity } : {};
    return {
      containerStyle: hasColor
        ? [COLORED_ICON_STYLE, { backgroundColor: colorData.backgroundColor }, opacityStyle, style]
        : [EMPTY_STYLE, opacityStyle, style],
      childColor: colorData.childColor,
      enhancedChildren: enhanceChildrenOptimized(children, colorData.childColor, size, papicon, fill)
    };
  }, [children, color, colors.text, style, size, opacity, papicon, fill]);

  return (
    <View
      {...rest}
      style={containerStyle}
    >
      {enhancedChildren}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for extreme performance
  return (
    prevProps.children === nextProps.children &&
    prevProps.color === nextProps.color &&
    prevProps.style === nextProps.style &&
    prevProps.size === nextProps.size &&
    prevProps.opacity === nextProps.opacity &&
    prevProps.papicon === nextProps.papicon &&
    prevProps.fill === nextProps.fill
  );
});

Icon.displayName = 'Icon';

// Ajouter le symbol au composant pour qu'il soit reconnu comme Leading
(Icon as any).__ITEM_TYPE__ = LEADING_TYPE;

export default Icon;