import React from "react";
import { Tabs } from "@/components/router/BottomTabs";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
    const { t } = useTranslation();
    return (
        <Tabs
            hapticFeedbackEnabled={true}
            sidebarAdaptable={true}
            labeled={false}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("Home"),
                    tabBarIcon: () => require("@/assets/icons/home.svg"),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: t("Calendar"),
                    tabBarIcon: () => require("@/assets/icons/calendar.svg"),
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: t("Tasks"),
                    tabBarIcon: () => require("@/assets/icons/tasks.svg"),
                }}
            />
            <Tabs.Screen
                name="grades"
                options={{
                    title: t("Grades"),
                    tabBarIcon: () => require("@/assets/icons/results.svg"),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("Profile"),
                    tabBarIcon: () => require("@/assets/icons/profile.svg"),
                }}
            />
        </Tabs>
    );
}
