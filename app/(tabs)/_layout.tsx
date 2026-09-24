import { Papicons } from '@getpapillon/papicons';
import BottomAccessory, { useBottomAccessoryVisible } from '@/components/BottomAccessory';
import { useAccountStore } from '@/stores/account';
import { useSettingsStore } from '@/stores/settings';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import useResizable from "@/ui/utils/Resizable";
import { useTheme } from "expo-router/react-navigation";
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, DynamicColorIOS } from 'react-native';
import { useFont } from '@/utils/theme/fonts';
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';

// Static platform detection - computed once at module load
const IS_IOS_WITH_PADDING = false;
const IS_ANDROID = Platform.OS === 'android';

function TabLayoutContent() {
  const theme = useTheme();
  const font = useFont();
  const { t } = useTranslation();
  const { isLarge } = useResizable();

  const settingsStore = useSettingsStore(state => state.personalization);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const disabledTabs = (lastUsedAccount
    ? settingsStore?.disabledTabsByAccount?.[lastUsedAccount]
    : settingsStore?.disabledTabs) || [];

  const iOSBottomAccessoryEnabled = settingsStore?.iOSBottomAccessoryEnabled ?? true;
  const showTabBarLabels = settingsStore?.showTabBarLabels ?? true;
  const labelsHidden = Platform.OS === 'ios' ? !showTabBarLabels : false;
  const isBottomAccessoryVisible = useBottomAccessoryVisible();

  const tabLabelStyle = {
    fontFamily: font("medium"),
    fontSize: Platform.OS === 'ios' ? isLarge ? 15 :12 : 13,
    color: Platform.OS === 'ios' ? DynamicColorIOS({
      dark: "#FFFFFF",
      light: "#000000"
    }) : undefined,
  } as const;

  const shouldRenderBottomAccessory =
    Platform.OS === 'ios' && runsIOS26 && iOSBottomAccessoryEnabled && isBottomAccessoryVisible;

  return (
    <NativeTabs
      tintColor={theme.colors.tint}
      labelStyle={tabLabelStyle}
      labelVisibilityMode={showTabBarLabels ? "labeled" : "selected"}
      rippleColor={theme.colors.tint + '22'}
      backgroundColor={Platform.OS === 'android' ? theme.colors.background : undefined}
      sidebarAdaptable
      minimizeBehavior={shouldRenderBottomAccessory ? "onScrollDown" : "never"}
      disableTransparentOnScrollEdge
      titlePositionAdjustment={runsIOS26 ? { vertical: 0, horizontal: 0 } : undefined}
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
    </NativeTabs>
  );
}

function DesktopTabLayout() {
  const theme = useTheme();
  const font = useFont();
  const { t } = useTranslation();
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const personalization = useSettingsStore(state => state.personalization);
  const disabledTabs = (lastUsedAccount
    ? personalization?.disabledTabsByAccount?.[lastUsedAccount]
    : personalization?.disabledTabs) || [];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.text + '99',
        tabBarLabelStyle: { fontFamily: font('medium'), fontSize: 13 },
        tabBarStyle: {
          position: 'absolute',
          bottom: 14,
          alignSelf: 'center',
          width: 420,
          maxWidth: '90%',
          height: 48,
          borderRadius: 24,
          borderTopWidth: 0,
          backgroundColor: theme.dark ? '#191919ee' : '#ffffffe8',
          shadowOpacity: 0.18,
          shadowRadius: 18,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('Tab_Home'), href: disabledTabs.includes('home') ? null : undefined, tabBarIcon: ({ color }) => <PapiconTabIcon name="Home" color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: t('Tab_Calendar'), href: disabledTabs.includes('calendar') ? null : undefined, tabBarIcon: ({ color }) => <PapiconTabIcon name="Calendar" color={color} /> }} />
      <Tabs.Screen name="tasks" options={{ title: t('Tab_Tasks'), href: disabledTabs.includes('tasks') ? null : undefined, tabBarIcon: ({ color }) => <PapiconTabIcon name="List" color={color} /> }} />
      <Tabs.Screen name="grades" options={{ title: t('Tab_Grades'), href: disabledTabs.includes('grades') ? null : undefined, tabBarIcon: ({ color }) => <PapiconTabIcon name="Grades" color={color} /> }} />
    </Tabs>
  );
}

function PapiconTabIcon({ name, color }: { name: string; color: string }) {
  return <Papicons name={name as any} size={19} color={color} />;
}

export default function TabLayout() {
  return (
    <MainTabErrorBoundary>
      {Platform.OS === 'web' ? <DesktopTabLayout /> : <TabLayoutContent />}
    </MainTabErrorBoundary>
  );
}
