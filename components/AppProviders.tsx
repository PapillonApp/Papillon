import { ThemeProvider } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DatabaseProvider } from "@/database/DatabaseProvider";
import { DEFAULT_MATERIAL_YOU_ENABLED, useSettingsStore } from '@/stores/settings';
import { AlertProvider } from '@/ui/components/AlertProvider';
import { DialogProvider } from '@/ui/components/DialogProvider';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { AppColors } from "@/utils/colors";
import { createDarkTheme, createDefaultTheme } from '@/utils/theme/Theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();
  const selectedTheme = useSettingsStore(state => state.personalization.theme);
  const selectedColorEnum = useSettingsStore(state => state.personalization.colorSelected);
  const useMaterialYou = useSettingsStore(state => state.personalization.useMaterialYou) ?? DEFAULT_MATERIAL_YOU_ENABLED;

  const color = useMemo(() => {
    const color = selectedColorEnum !== null ? AppColors.find(appColor => appColor.colorEnum === selectedColorEnum) : null;
    return color || AppColors[0];
  }, [selectedColorEnum]);

  // Memoize theme selection to prevent unnecessary re-computations
  const theme = useMemo(() => {
    const defaultTheme = createDefaultTheme(useMaterialYou, color.mainColor);
    const darkTheme = createDarkTheme(useMaterialYou, color.mainColor);
    const newScheme = selectedTheme === 'auto' ? (colorScheme === 'dark' ? darkTheme : defaultTheme) : (selectedTheme === 'dark' ? darkTheme : defaultTheme);
    return newScheme;
  }, [colorScheme, color, selectedTheme, useMaterialYou]);

  // Memoize background color to prevent string recreation
  const backgroundColor = useMemo(() => {
    return colorScheme === 'dark' ? '#000000' : '#F5F5F5';
  }, [colorScheme]);

  // Combined effect for system UI updates to reduce effect overhead
  useEffect(() => {
    if (runsIOS26) {
      SystemUI.setBackgroundColorAsync(backgroundColor);
    }
    else {
      SystemUI.setBackgroundColorAsync("#000000");
    }
  }, [backgroundColor]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
      <DatabaseProvider>
        <ThemeProvider value={theme}>
          <DialogProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </DialogProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
