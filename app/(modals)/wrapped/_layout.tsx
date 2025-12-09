import { Stack } from "expo-router";
import React from "react";

import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function Layout() {
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
