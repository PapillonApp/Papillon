import useResizable from '@/ui/utils/Resizable';
import { useFont } from '@/utils/theme/fonts';
import { useTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();
  const font = useFont();
  const { isLarge } = useResizable();
  const { t } = useTranslation();

  const tabLabelStyle = {
    fontFamily: font("medium")
  } as const;

  return (
    <NativeTabs
      sidebarAdaptable
      tintColor={theme.colors.tint}
      labelStyle={tabLabelStyle}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t("Tab_Home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/icons/home.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>{t("Tab_Calendar")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/icons/calendar.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks">
        <NativeTabs.Trigger.Label>{t("Tab_Tasks")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/icons/tasks.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <NativeTabs.Trigger.Label>{t("Tab_Grades")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/icons/pie.png')} renderingMode='template' />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
