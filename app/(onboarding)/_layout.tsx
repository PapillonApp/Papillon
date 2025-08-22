import React from 'react';

import { screenOptions } from "@/utils/theme/ScreenOptions";
import { Stack } from '@/utils/native/AnimatedNavigator';
import Transition from 'react-native-screen-transitions';
import { View } from 'react-native';
import { Services } from '@/stores/account/types';

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
        headerBackButtonMenuEnabled: false,
        ...Transition.presets.ElasticCard(),
        gesturesEnabled: false,
        gestureDirection: []
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
                    initialParams={{ service: Services.PRONOTE }}
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
                />
                <Stack.Screen
                    name="university/method"
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
                    name="skolengo/webview"
                    options={{ ...newScreenOptions }}
                    initialParams={{ ref: {} }}
                />
            </Stack>
        </View>
    );
}