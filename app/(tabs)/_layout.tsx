import React from 'react';

import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationEventMap,
  NativeBottomTabNavigationOptions,
} from "@bottom-tabs/react-navigation";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { Platform } from 'react-native';

import { useTranslation } from "react-i18next";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

const isiOS = Platform.OS === 'ios' && !Platform.isPad && parseInt(Platform.Version) >= 26;

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
    sidebarAdaptable
    hapticFeedbackEnabled
    tabLabelStyle={{
      fontFamily: 'semibold',
      fontSize: 12,
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("Home"),
          tabBarIcon: () => 
            isiOS ? require('@/assets/icons/home_padding.svg') :
              require('@/assets/icons/home.svg'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("Calendar"),
          tabBarIcon: () =>
            isiOS ? require('@/assets/icons/calendar_padding.svg') :
              require('@/assets/icons/calendar.svg'),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t("Tasks"),
          tabBarIcon: () => 
            isiOS ? require('@/assets/icons/tasks_padding.svg') :
              require('@/assets/icons/tasks.svg'),
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: t("Grades"),
          tabBarIcon: () =>
            isiOS ? require('@/assets/icons/results_padding.svg') :
              require('@/assets/icons/results.svg'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("Profile"),
          tabBarIcon: () =>
            isiOS ? require('@/assets/icons/profile_padding.svg') :
              require('@/assets/icons/profile.svg'),
        }}
      />
    </Tabs>
  );
}
