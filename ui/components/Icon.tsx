import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { View, ViewProps } from "react-native";
import { LEADING_TYPE } from "./Item";

interface IconProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
}

const Icon = React.memo<IconProps>(({
  children,
  color,
  ...rest
}) => {
  const { colors } = useTheme();
  
  const enhancedChildren = useMemo(() => 
    React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Type assertion for SVG elements that accept color prop
        return React.cloneElement(child as React.ReactElement<any>, { 
          color: color ? "#ffffff" : colors.text 
        });
      }
      return child;
    }), [children, colors.text]
  );

  return (
    <View
      {...rest}
      style={[
        color ? {
          backgroundColor: color,
          padding: 4,
          borderRadius: 8,
          borderCurve: "continuous",
          marginRight: -4,
        } : {}
      ]}
    >
      {enhancedChildren}
    </View>
  );
});

Icon.displayName = 'Icon';

// Ajouter le symbol au composant pour qu'il soit reconnu comme Leading
(Icon as any).__ITEM_TYPE__ = LEADING_TYPE;

export default Icon;