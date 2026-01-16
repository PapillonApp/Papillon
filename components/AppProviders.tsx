import React, { useMemo, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';

import { DatabaseProvider } from "@/database/DatabaseProvider";
import { AlertProvider } from '@/ui/components/AlertProvider';
import { useSettingsStore } from '@/stores/settings';
import { AppColors } from "@/utils/colors";
import { DarkTheme, DefaultTheme } from '@/utils/theme/Theme';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();
  const selectedTheme = useSettingsStore(state => state.personalization.theme);
  const selectedColorEnum = useSettingsStore(state => state.personalization.colorSelected);

  const color = useMemo(() => {
    const color = selectedColorEnum !== null ? AppColors.find(appColor => appColor.colorEnum === selectedColorEnum) : null;
    return color || AppColors[0];
  }, [selectedColorEnum]);

  // Memoize theme selection to prevent unnecessary re-computations
  const theme = useMemo(() => {
    const newScheme = selectedTheme === 'auto' ? (colorScheme === 'dark' ? DarkTheme : DefaultTheme) : (selectedTheme === 'dark' ? DarkTheme : DefaultTheme);
    return {
      ...newScheme,
      colors: {
        ...newScheme.colors,
        primary: color?.mainColor ?? newScheme.colors.primary,
      },
    };
  }, [colorScheme, color, selectedTheme]);

  // Memoize background color to prevent string recreation
  const backgroundColor = useMemo(() => {
    return colorScheme === 'dark' ? '#000000' : '#F5F5F5';
  }, [colorScheme]);

  // Memoize status bar style to prevent string recreation
  const statusBarStyle = useMemo(() => {
    return colorScheme === 'dark' ? 'light-content' : 'dark-content';
  }, [colorScheme]);

  // Combined effect for system UI updates to reduce effect overhead
  useEffect(() => {
    if (runsIOS26) {
      SystemUI.setBackgroundColorAsync(backgroundColor);
    }
    else {
      SystemUI.setBackgroundColorAsync("#000000");
    }
    StatusBar.setBarStyle(statusBarStyle);
  }, [backgroundColor, statusBarStyle]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
      <DatabaseProvider>
        <ThemeProvider value={theme}>
          <AlertProvider>
            {children}
          </AlertProvider>
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
