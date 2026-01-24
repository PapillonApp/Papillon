import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationEventMap,
  NativeBottomTabNavigationOptions,
} from "@bottom-tabs/react-navigation";
import { ParamListBase, TabNavigationState, useTheme } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import React, { useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { Platform } from 'react-native';

import { useSettingsStore } from "@/stores/settings";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

// Static platform detection - computed once at module load
const IS_IOS_WITH_PADDING = runsIOS26;
const IS_ANDROID = Platform.OS === 'android';

// Pre-load all icons to avoid runtime require() calls
const ICONS = {
  home: IS_IOS_WITH_PADDING ?
    require('@/assets/icons/home_padding.svg')
    : require('@/assets/icons/home.svg'),
  calendar: IS_IOS_WITH_PADDING ? require('@/assets/icons/calendar_padding.svg') : require('@/assets/icons/calendar.svg'),
  tasks: IS_IOS_WITH_PADDING ? require('@/assets/icons/tasks_padding.svg') : require('@/assets/icons/tasks.svg'),
  grades: IS_IOS_WITH_PADDING ? require('@/assets/icons/results_padding.svg') : require('@/assets/icons/results.svg'),
  news: IS_IOS_WITH_PADDING ? require('@/assets/icons/news_padding.svg') : require('@/assets/icons/news.svg'),
} as const;

// Static style object to prevent recreation on every render
const TAB_LABEL_STYLE = {
  fontFamily: 'medium',
  fontSize: Platform.OS === 'ios' ? 13 : 13,
} as const;

// Static icon functions to prevent recreation
const getHomeIcon = () => ICONS.home;
const getCalendarIcon = () => ICONS.calendar;
const getTasksIcon = () => ICONS.tasks;
const getGradesIcon = () => ICONS.grades;
const getNewsIcon = () => ICONS.news;

// Custom hook for optimized tab translations
const useTabTranslations = () => {
  const { t } = useTranslation();

  return useMemo(() => ({
    home: t("Tab_Home"),
    calendar: t("Tab_Calendar"),
    tasks: t("Tab_Tasks"),
    grades: t("Tab_Grades"),
    news: t("Tab_News"),
  }), [t]);
};

export default function TabLayout() {
  // Use optimized translation hook
  const translations = useTabTranslations();
  const { colors } = useTheme();

  // Memoize screen options to prevent object recreation
  const screenOptions = useMemo(() => ({
    index: {
      title: translations.home,
      tabBarIcon: getHomeIcon,
    },
    calendar: {
      title: translations.calendar,
      tabBarIcon: getCalendarIcon,
    },
    tasks: {
      title: translations.tasks,
      tabBarIcon: getTasksIcon,
    },
    grades: {
      title: translations.grades,
      tabBarIcon: getGradesIcon,
    },
    news: {
      title: translations.news,
      tabBarIcon: getNewsIcon,
    },
  }), [translations]);

  const settingsStore = useSettingsStore(state => state.personalization);
  const disabledTabs = settingsStore?.disabledTabs || [];

  return (
    <Tabs
      sidebarAdaptable
      hapticFeedbackEnabled
      labeled={true}
      tabLabelStyle={TAB_LABEL_STYLE}
      tabBarStyle={{
        backgroundColor: colors.card,
      }}
      rippleColor={colors.text + "22"}
      activeIndicatorColor={colors.primary + "22"}
    >
      <Tabs.Screen
        name="index"
        options={{ ...screenOptions.index }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ ...screenOptions.calendar, tabBarItemHidden: disabledTabs.includes("calendar") }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ ...screenOptions.tasks, tabBarItemHidden: disabledTabs.includes("tasks") }}
      />
      <Tabs.Screen
        name="grades"
        options={{ ...screenOptions.grades, tabBarItemHidden: disabledTabs.includes("grades") }}
      />
      <Tabs.Screen
        name="news"
        options={{ ...screenOptions.news, tabBarItemHidden: disabledTabs.includes("news") }}
      />
    </Tabs>
  );
}