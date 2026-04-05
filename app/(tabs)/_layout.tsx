import BottomAccessory from '@/components/BottomAccessory';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { useTheme } from '@react-navigation/native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

// Static platform detection - computed once at module load
const IS_IOS_WITH_PADDING = runsIOS26;
const IS_ANDROID = Platform.OS === 'android';

const TAB_LABEL_STYLE = {
  fontFamily: 'medium',
  fontSize: Platform.OS === 'ios' ? 13 : 13,
} as const;

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <NativeTabs
      tintColor={theme.colors.tint}
      labelStyle={TAB_LABEL_STYLE}
      labelVisibilityMode="labeled"
      rippleColor={theme.colors.tint + '22'}
      backgroundColor={Platform.OS === 'android' ? theme.colors.background : undefined}
      sidebarAdaptable
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.BottomAccessory>
        <BottomAccessory />
      </NativeTabs.BottomAccessory>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t("Tab_Home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/home_padding.png') : require('@/assets/icons/home.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>{t("Tab_Calendar")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/calendar_padding.png') : require('@/assets/icons/calendar.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks">
        <NativeTabs.Trigger.Label>{t("Tab_Tasks")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/tasks_padding.png') : require('@/assets/icons/tasks.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades">
        <NativeTabs.Trigger.Label>{t("Tab_Grades")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/pie_padding.png') : require('@/assets/icons/pie.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="news">
        <NativeTabs.Trigger.Label>{t("Tab_News")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/newspaper_padding.png') : require('@/assets/icons/newspaper.png')} renderingMode='template' />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
