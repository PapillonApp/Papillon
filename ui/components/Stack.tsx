import React from "react";
import { FlexAlignType,StyleSheet, View, ViewProps, ViewStyle } from "react-native";

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

const alignItemsMap: Record<Alignment, FlexAlignType> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

const justifyContentMap: Record<Alignment, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

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
  const flexDirection = direction === "vertical" ? "column" : "row";

  // Utilisation de StyleSheet pour de meilleures performances
  const baseStyle = React.useMemo(
    () => [
      styles.base,
      {
        flexDirection,
        gap,
        padding,
        margin,
        alignItems: alignItemsMap[hAlign],
        justifyContent: justifyContentMap[vAlign],
      },
      backgroundColor && { backgroundColor },
      radius && { borderRadius: radius, borderCurve: "continuous", overflow: "hidden" },
      inline && { width: "fit-content", display: "inline-flex" },
    ],
    [flexDirection, gap, padding, margin, hAlign, vAlign, backgroundColor, radius, inline]
  );

  return (
    <View {...rest} style={[baseStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
});

export default Stack;