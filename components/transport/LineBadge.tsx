import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import type { Line } from "papillon-transport";
import React from "react";
import { View } from "react-native";

import { contrast, icon } from "@/services/transport/lineColors";
import Typography from "@/ui/new/Typography";

export function LineBadge({ line }: { line: Line }) {
  const { colors } = useTheme();
  const text = String(colors.text);
  const background = line.color ?? text + "14";
  const foreground = contrast(line) ?? text;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: background,
      }}
    >
      <Papicons name={icon(line.mode)} fill={foreground} size={14} />
      {line.shortName ? (
        <Typography variant="caption" color={foreground} weight="semibold" numberOfLines={1}>
          {line.shortName}
        </Typography>
      ) : null}
    </View>
  );
}
