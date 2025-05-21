import React from 'react';
import { Tabs } from '@/components/router/BottomTabs';

export default function TabLayout() {
  return (
    <Tabs
      hapticFeedbackEnabled={true}
      sidebarAdaptable={true}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => require('@/assets/icons/home.svg'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: () => require('@/assets/icons/calendar.svg'),
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: 'Grades',
          tabBarIcon: () => require('@/assets/icons/results.svg'),
        }}
      />
    </Tabs>
  );
}
