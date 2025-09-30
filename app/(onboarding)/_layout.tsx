import React from 'react';
import { View } from 'react-native';

import { Services } from '@/stores/account/types';
import { Stack } from '@/utils/native/AnimatedNavigator';
import { screenOptions } from "@/utils/theme/ScreenOptions";

export default function OnboardingLayout() {
  const newScreenOptions = React.useMemo(() => ({
    ...screenOptions,
    headerShown: false,
    headerBackVisible: true,
    headerTitle: '',
    gestureEnabled: false,
    headerTransparent: true,
    headerTintColor: "#FFFFFF",
    headerBackButtonDisplayMode: "minimal",
    headerBackButtonMenuEnabled: false
  }), []);

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            <Stack>
                <Stack.Screen
                    name="welcome"
                    options={{ ...newScreenOptions }}
                />
                <Stack.Screen
                    name="serviceSelection"
                    options={{ ...newScreenOptions }}
                />
                <Stack.Screen
                    name="school/method"
                    options={{ ...newScreenOptions }}
                    initialParams={{ service: Services.PRONOTE }}
                />
                <Stack.Screen
                    name="school/map"
                    options={{ ...newScreenOptions }}
                    initialParams={{ service: Services.PRONOTE, method: "automatic", city: "Paris" }}
                />
                <Stack.Screen
                    name="school/search"
                    options={{ ...newScreenOptions }}
                    initialParams={{ service: Services.PRONOTE }}
                />
                <Stack.Screen
                    name="end/color"
                    options={{ ...newScreenOptions }}
                    initialParams={{ accountId: "" }}
                />
                <Stack.Screen
                    name="restaurants/method"
                    options={{ ...newScreenOptions }}
                    initialParams={{ action: "addAccount" }}
                />
                <Stack.Screen
                    name="university/method"
                    options={{ ...newScreenOptions }}
                />
                <Stack.Screen
                    name="university/multi/credentials"
                    options={{ ...newScreenOptions }}
                />
                <Stack.Screen
                    name="pronote/url"
                    options={{ ...newScreenOptions }}
                />
                <Stack.Screen
                    name="pronote/webview"
                    options={{ ...newScreenOptions }}
                    initialParams={{ url: "" }}
                />
                <Stack.Screen
                    name="pronote/credentials"
                    options={{ ...newScreenOptions }}
                    initialParams={{ url: "", previousPage: "map" }}
                />
                <Stack.Screen
                    name="ecoledirecte/credentials"
                    options={{ ...newScreenOptions }}
                    initialParams={{ url: "", previousPage: "map" }}
                />
                <Stack.Screen
                    name="izly/credentials"
                    options={{ ...newScreenOptions }}
                    initialParams={{ url: "", previousPage: "map" }}
                />
                <Stack.Screen
                    name="pronote/qrcode"
                    options={{ ...newScreenOptions }}
                />
                <Stack.Screen
                    name="pronote/2fa"
                    options={{ ...newScreenOptions }}
                    initialParams={{ error: {}, session: {}, device: "" }}
                />
                <Stack.Screen
                    name="turboself/credentials"
                    options={{ ...newScreenOptions }}
                    initialParams={{ action: "addAccount" }}
                />
                <Stack.Screen
                    name="turboself/hostSelector"
                    options={{ ...newScreenOptions }}
                    initialParams={{ siblings: [], username: "", password: "", action: "addAccount" }}
                />
                <Stack.Screen
                    name="ard/credentials"
                    options={{ ...newScreenOptions }}
                    initialParams={{ action: "addAccount" }}
                />
                <Stack.Screen
                    name="alise/credentials"
                    options={{ ...newScreenOptions }}
                    initialParams={{ action: "addAccount" }}
                />
                <Stack.Screen
                    name="skolengo/webview"
                    options={{ ...newScreenOptions }}
                    initialParams={{ ref: {} }}
                />
            </Stack>
        </View>
    );
}