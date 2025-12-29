import { Stack } from "expo-router";
import React from "react";

import { screenOptions } from "@/utils/theme/ScreenOptions";

export const SHADOW_OVER_ANIMATED_BG = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0.9,
  shadowRadius: 1.5,
}


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
