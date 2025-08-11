import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';

import { screenOptions } from "@/utils/theme/ScreenOptions";
import { useTranslation } from 'react-i18next';

export default function OnboardingLayout() {
    const theme = useTheme();

    const { t } = useTranslation();

    const newScreenOptions = React.useMemo(() => ({
        ...screenOptions,
        headerShown: false,
        headerBackVisible: true,
        headerTitle: '',
        gestureEnabled: false,
    }), []);

    return (
        <Stack>
            <Stack.Screen name="welcome" options={newScreenOptions} />
            <Stack.Screen name="serviceSelection" options={{ headerTitle: "", headerTransparent: true, headerTintColor: "#FFFFFF", headerBackButtonDisplayMode: "minimal" }} />
        </Stack>
    );
}