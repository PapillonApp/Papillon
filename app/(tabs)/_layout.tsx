import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs sidebarAdaptable>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks">
        <NativeTabs.Trigger.Label>Tasks</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.circle.fill" md="check-circle" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <NativeTabs.Trigger.Label>Grades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="graduationcap.fill" md="school" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
