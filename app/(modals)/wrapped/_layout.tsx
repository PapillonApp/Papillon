import { Stack } from "expo-router";
import React from "react";

import { useScreenOptions } from "@/utils/theme/ScreenOptions";

export default function Layout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
