import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { screenOptions } from "@/utils/theme/ScreenOptions";
import { Pressable } from "react-native";
import { Check } from "lucide-react-native";

export default function Layout() {
    const { t } = useTranslation();

    const newScreenOptions = React.useMemo(() => ({
        ...screenOptions,
        headerShown: true,
        headerLargeTitle: false
    }), []);

    return (
        <Stack screenOptions={newScreenOptions}>
            <Stack.Screen
                name="event"
                options={{
                    headerTitle: t("Tab_New_Event"),
                }}
            />
        </Stack>
    );
}
