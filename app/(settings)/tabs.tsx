import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import NativeSwitch from "@/ui/native/NativeSwitch";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const SettingsTabs = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);

  const iOSBottomAccessoryEnabled = settingsStore.iOSBottomAccessoryEnabled ?? true;
  const showTabBarLabels = settingsStore.showTabBarLabels ?? true;

  const disabledTabsByAccount = settingsStore?.disabledTabsByAccount || {};
  const disabledTabs = (lastUsedAccount
    ? disabledTabsByAccount[lastUsedAccount]
    : settingsStore?.disabledTabs) || [];

  const tabs = [
    {
      id: "calendar",
      name: t("Tab_Calendar"),
      icon: "calendar",
      enabled: !disabledTabs.includes("calendar"),
    },
    {
      id: "tasks",
      name: t("Tab_Tasks"),
      icon: "tasks",
      enabled: !disabledTabs.includes("tasks"),
    },
    {
      id: "grades",
      name: t("Tab_Grades"),
      icon: "grades",
      enabled: !disabledTabs.includes("grades"),
    },
  ];

  const toggleTab = (tabId: string) => {
    const nextDisabledTabs = disabledTabs.includes(tabId)
      ? disabledTabs.filter(id => id !== tabId)
      : [...disabledTabs, tabId];
    const nextDisabledTabsByAccount = lastUsedAccount
      ? {
          ...disabledTabsByAccount,
          [lastUsedAccount]: nextDisabledTabs,
        }
      : disabledTabsByAccount;

    if (disabledTabs.includes(tabId)) {
      mutateProperty("personalization", {
        ...settingsStore,
        disabledTabs: nextDisabledTabs,
        disabledTabsByAccount: nextDisabledTabsByAccount,
      });
    } else {
      mutateProperty("personalization", {
        ...settingsStore,
        disabledTabs: nextDisabledTabs,
        disabledTabsByAccount: nextDisabledTabsByAccount,
      });
    }
  };

  return (
    <List
      contentInsetAdjustmentBehavior="automatic"
      safeHorizontalPadding={16}
      contentContainerStyle={{ paddingVertical: 16 }}
      style={{ flex: 1, backgroundColor: colors.overground }}
    >
      <List.Section>
        {tabs.map(tab => (
          <List.Item key={tab.id}>
            <List.Leading>
              <Icon>
                <Papicons name={tab.icon} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{tab.name}</Typography>
            <List.Trailing>
              <NativeSwitch
                value={tab.enabled}
                onValueChange={() => toggleTab(tab.id)}
              />
            </List.Trailing>
          </List.Item>
        ))}
      </List.Section>

      <List.Section>
        <List.SectionTitle>
          <List.Label>{t("Settings_Features_TabBar")}</List.Label>
        </List.SectionTitle>

        {Platform.OS === "ios" && (
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"Sunrise"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Settings_Features_BottomAccessory")}</Typography>
            <Typography color="textSecondary" numberOfLines={2}>
              {t("Settings_Features_BottomAccessory_Description")}
            </Typography>
            <List.Trailing>
              <NativeSwitch
                value={iOSBottomAccessoryEnabled}
                onValueChange={(value) =>
                  mutateProperty("personalization", {
                    iOSBottomAccessoryEnabled: value,
                  })
                }
              />
            </List.Trailing>
          </List.Item>
        )}

        <List.Item>
          <List.Leading>
            <Icon>
              <Papicons name={"Font"} />
            </Icon>
          </List.Leading>
          <Typography variant="title">{t("Settings_Features_ShowTabBarLabels")}</Typography>
          <Typography color="textSecondary" numberOfLines={2}>
            {t("Settings_Features_ShowTabBarLabels_Description")}
          </Typography>
          <List.Trailing>
            <NativeSwitch
              value={showTabBarLabels}
              onValueChange={(value) =>
                mutateProperty("personalization", {
                  showTabBarLabels: value,
                })
              }
            />
          </List.Trailing>
        </List.Item>
      </List.Section>
    </List>
  );
};

export default SettingsTabs;
