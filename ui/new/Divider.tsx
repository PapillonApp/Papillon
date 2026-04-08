import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

export default function Divider({ height = 1, ghost = false, color }: { height?: number, ghost?: boolean, color?: string }) {
  const { colors } = useTheme();

  const backgroundColor = ghost ? "transparent" : color ? color : colors.border;

  return (
    <View style={{ height, backgroundColor: backgroundColor, width: "100%" }} />
  )
}