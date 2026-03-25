import React from 'react';
import { View } from 'react-native';

import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function OnboardingLayout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: true,
    headerBackVisible: true,
    headerTransparent: true,
    headerBackButtonDisplayMode: "minimal",
    headerLargeTitle: false,
  }), []);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="locate"
          options={{ ...newScreenOptions, title: "Recherche de l'emplacement" }}
        />
        <Stack.Screen
          name="select"
          options={{ ...newScreenOptions, title: "Établissements" }}
        />
        <Stack.Screen
          name="url"
          options={{ ...newScreenOptions, title: "URL de l'établissement" }}
        />
        <Stack.Screen
          name="browser"
          options={{ ...newScreenOptions, title: "Connexion par ENT", presentation: "modal" }}
        />
        <Stack.Screen
          name="qrcode"
          options={{ ...newScreenOptions, title: "Connexion par QR-Code" }}
        />
      </Stack>
    </View>
  );
}