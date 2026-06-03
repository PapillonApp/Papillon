import { Papicons } from "@getpapillon/papicons";
import React from "react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/stores/settings";
import { useAccountStore } from "@/stores/account";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import NativeSwitch from "@/ui/native/NativeSwitch";

const SettingsTabs = () => {
  const { t } = useTranslation();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);

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
    {
      id: "news",
      name: t("Tab_News"),
      icon: "newspaper",
      enabled: !disabledTabs.includes("news"),
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
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={{ padding: 16 }}
      style={{ flex: 1 }}
    >
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
    </List>
  );
};

export default SettingsTabs;
