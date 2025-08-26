import { useTheme } from '@react-navigation/native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

const IS_IOS_WITH_PADDING = Platform.OS === 'ios' && !Platform.isPad && parseInt(Platform.Version) >= 26;
const IS_ANDROID = Platform.OS === 'android';

export default function TabLayout() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <NativeTabs
      tintColor={colors.primary}
      labelStyle={{
        fontFamily: "medium",
        fontSize: 12
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <Label>Calendar</Label>
        <Icon sf="calendar" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks">
        <Label>Tasks</Label>
        <Icon sf="checklist" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <Label>Grades</Label>
        <Icon sf="chart.pie.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf="person.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}