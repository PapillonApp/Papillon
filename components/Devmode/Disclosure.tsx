import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { ActivityIndicator } from "react-native";

import Stack from "@/ui/components/Stack";
import Typography from "@/ui/new/Typography";

export default function Disclosure({ value, loading = false }: { value?: string | number; loading?: boolean }) {
  const { colors } = useTheme();

  return (
    <Stack direction="horizontal" hAlign="center" gap={6}>
      {loading ? (
        <ActivityIndicator />
      ) : value != null ? (
        <Typography variant="body1" color="textSecondary">
          {value}
        </Typography>
      ) : null}
      <Papicons name="ChevronRight" size={16} color={String(colors.text) + "66"} />
    </Stack>
  );
}
