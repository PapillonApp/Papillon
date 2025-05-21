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
          tabBarIcon: () => ({ sfSymbol: "house" }),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: () => ({ sfSymbol: "calendar" }),
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: 'Grades',
          tabBarIcon: () => ({ sfSymbol: "chart.pie.fill" }),
        }}
      />
    </Tabs>
  );
}
