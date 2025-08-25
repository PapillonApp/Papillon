import { Stack } from "expo-router";
import React from "react";

import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function Layout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerLargeTitle: runsIOS26(),
    headerBackVisible: true,
  }), []);

  return (
    <Stack>
      <Stack.Screen
        name="news"
        options={{ ...newScreenOptions }}
        initialParams={{ news: [] }}
      />
      <Stack.Screen
        name="specific"
        options={{ ...newScreenOptions }}
        initialParams={{ news: {} }}
      />
    </Stack>
  );
}
