import BottomAccessory from '@/components/BottomAccessory';
import { useSettingsStore } from '@/stores/settings';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { useTheme } from '@react-navigation/native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

// Static platform detection - computed once at module load
const IS_IOS_WITH_PADDING = false;
const IS_ANDROID = Platform.OS === 'android';

const TAB_LABEL_STYLE = {
  fontFamily: 'medium',
  fontSize: Platform.OS === 'ios' ? 12 : 13,
} as const;

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useTranslation();


  const settingsStore = useSettingsStore(state => state.personalization);
  const disabledTabs = settingsStore?.disabledTabs || [];

  const iOSBottomAccessoryEnabled = settingsStore?.iOSBottomAccessoryEnabled ?? true;
  const showTabBarLabels = settingsStore?.showTabBarLabels ?? true;
  const labelsHidden = Platform.OS === 'ios' ? !showTabBarLabels : false;

  const shouldRenderBottomAccessory =
    Platform.OS !== 'ios' || iOSBottomAccessoryEnabled;

  return (
    <NativeTabs
      tintColor={theme.colors.tint}
      labelStyle={TAB_LABEL_STYLE}
      labelVisibilityMode={showTabBarLabels ? "labeled" : "selected"}
      rippleColor={theme.colors.tint + '22'}
      backgroundColor={Platform.OS === 'android' ? theme.colors.background : undefined}
      sidebarAdaptable
      minimizeBehavior={iOSBottomAccessoryEnabled ? "onScrollDown" : "never"}
      disableTransparentOnScrollEdge
      titlePositionAdjustment={runsIOS26 ? { vertical: 6, horizontal: 0 } : undefined}
    >
      {shouldRenderBottomAccessory && (
        <NativeTabs.BottomAccessory>
          <BottomAccessory />
        </NativeTabs.BottomAccessory>
      )}

      <NativeTabs.Trigger name="index"  hidden={disabledTabs.includes('home')}>
        <NativeTabs.Trigger.Label hidden={labelsHidden}>{t("Tab_Home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/home_padding.png') : require('@/assets/icons/home.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar" hidden={disabledTabs.includes('calendar')}>
        <NativeTabs.Trigger.Label hidden={labelsHidden}>{t("Tab_Calendar")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/calendar_padding.png') : require('@/assets/icons/calendar.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks" hidden={disabledTabs.includes('tasks')}>
        <NativeTabs.Trigger.Label hidden={labelsHidden}>{t("Tab_Tasks")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/tasks_padding.png') : require('@/assets/icons/tasks.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grades" hidden={disabledTabs.includes('grades')}>
        <NativeTabs.Trigger.Label hidden={labelsHidden}>{t("Tab_Grades")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/pie_padding.png') : require('@/assets/icons/pie.png')} renderingMode='template' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="news" hidden={disabledTabs.includes('news')}>
        <NativeTabs.Trigger.Label hidden={labelsHidden}>{t("Tab_News")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={IS_IOS_WITH_PADDING ? require('@/assets/icons/newspaper_padding.png') : require('@/assets/icons/newspaper.png')} renderingMode='template' />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
