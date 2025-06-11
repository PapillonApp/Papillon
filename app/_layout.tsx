import "react-native-reanimated";
import "@/utils/i18n";

import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import React, { useColorScheme } from "react-native";

import { DarkTheme, DefaultTheme } from "@/utils/theme/Theme";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

export const unstableSettings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const [loaded, error] = useFonts({
        light: require("../assets/fonts/SNPro-Light.ttf"),
        regular: require("../assets/fonts/SNPro-Regular.ttf"),
        medium: require("../assets/fonts/SNPro-Medium.ttf"),
        semibold: require("../assets/fonts/SNPro-Semibold.ttf"),
        bold: require("../assets/fonts/SNPro-Bold.ttf"),
        black: require("../assets/fonts/SNPro-Black.ttf"),
    });

    useEffect(() => {
        if (error) {throw error;}
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Stack initialRouteName="(tabs)">
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}
