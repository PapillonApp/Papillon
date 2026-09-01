import React from "react";
import { Stack } from "expo-router";

import { AndroidHeaderProps } from "@/components/AndroidHeaderBackground";
import { useScreenOptions } from "@/utils/theme/ScreenOptions";

export default function MyCpeOnboardingLayout() {
  const screenOptions = useScreenOptions();
  const loginScreenOptions = React.useMemo(
    () => ({
      ...screenOptions,
      ...AndroidHeaderProps,
      headerShown: true,
      headerTransparent: true,
      headerBackButtonDisplayMode: "minimal" as const,
      headerLargeTitle: false,
      headerTitle: "My CPE Lyon",
    }),
    [screenOptions]
  );

  return (
    <Stack>
      <Stack.Screen name="credentials" options={loginScreenOptions} />
    </Stack>
  );
}
