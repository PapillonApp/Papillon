import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';

export default function OnboardingLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="welcome" />
        </Stack>
    );
}