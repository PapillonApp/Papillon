import { useTheme } from "@react-navigation/native";
import React, { useMemo, useCallback } from "react";
import { View, ViewProps } from "react-native";

import { LEADING_TYPE } from "./Item";

interface IconProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
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
  childColor: string
): React.ReactNode => {
  if (!children) return children;
  
  // Fast path for single child (most common case)
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { 
      color: childColor 
    });
  }
  
  // Batch processing for multiple children
  return React.Children.map(children, (child) => {
    return React.isValidElement(child) 
      ? React.cloneElement(child as React.ReactElement<any>, { color: childColor })
      : child;
  });
};

const Icon = React.memo<IconProps>(({
  children,
  color,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  
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
    
    return {
      containerStyle: hasColor 
        ? [COLORED_ICON_STYLE, { backgroundColor: colorData.backgroundColor }, style]
        : [EMPTY_STYLE, style],
      childColor: colorData.childColor,
      enhancedChildren: enhanceChildrenOptimized(children, colorData.childColor)
    };
  }, [children, color, colors.text, style]);

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
    prevProps.style === nextProps.style
  );
});

Icon.displayName = 'Icon';

// Ajouter le symbol au composant pour qu'il soit reconnu comme Leading
(Icon as any).__ITEM_TYPE__ = LEADING_TYPE;

export default Icon;