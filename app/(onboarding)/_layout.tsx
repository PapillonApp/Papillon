import React from 'react';
import { useTheme } from '@react-navigation/native';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

import { screenOptions } from "@/utils/theme/ScreenOptions";
import { useTranslation } from 'react-i18next';
import { Stack } from '@/utils/native/AnimatedNavigator';
import Transition from 'react-native-screen-transitions';
import { View } from 'react-native';

export default function OnboardingLayout() {
  const theme = useTheme();

  const { t } = useTranslation();

  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: false,
    headerBackVisible: true,
    headerTitle: '',
    gestureEnabled: false,
    headerTransparent: true,
    headerTintColor: "#FFFFFF",
    headerBackButtonDisplayMode: "minimal",
    headerBackButtonMenuEnabled: false,
    ...Transition.presets.ElasticCard(),
    gesturesEnabled: false,
    gestureDirection: []
  }), []);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Stack>
        <Stack.Screen name="welcome" options={{ ...newScreenOptions }} />
        <Stack.Screen name="serviceSelection" options={{ ...newScreenOptions }} />
        <Stack.Screen name="pronote/method" options={{ ...newScreenOptions }} />
        <Stack.Screen name="university/method" options={{ ...newScreenOptions }} />
      </Stack>
    </View>
  );
}