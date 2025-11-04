import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
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
  profile: IS_IOS_WITH_PADDING ? require('@/assets/icons/profile_padding.svg') : require('@/assets/icons/profile.svg'),
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
const getProfileIcon = () => ICONS.profile;

// Custom hook for optimized tab translations
const useTabTranslations = () => {
  const { t } = useTranslation();

  return useMemo(() => ({
    home: t("Tab_Home"),
    calendar: t("Tab_Calendar"),
    tasks: t("Tab_Tasks"),
    grades: t("Tab_Grades"),
    profile: t("Tab_Profile"),
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
    profile: {
      title: translations.profile,
      tabBarIcon: getProfileIcon,
    },
  }), [translations]);

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
        options={screenOptions.index}
      />
      <Tabs.Screen
        name="calendar"
        options={screenOptions.calendar}
      />
      <Tabs.Screen
        name="tasks"
        options={screenOptions.tasks}
      />
      <Tabs.Screen
        name="grades"
        options={screenOptions.grades}
      />
      <Tabs.Screen
        name="profile"
        options={screenOptions.profile}
      />
    </Tabs>
  );
}