import { Papicons } from "@getpapillon/papicons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import Item, { Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";

const SettingsTabs = () => {
  const { t } = useTranslation();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const disabledTabs = settingsStore?.disabledTabs || [];

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
    }
  ]

  const toggleTab = (tabId: string) => {
    if (disabledTabs.includes(tabId)) {
      mutateProperty("personalization", { ...settingsStore, disabledTabs: disabledTabs.filter(id => id !== tabId) });
    } else {
      mutateProperty("personalization", { ...settingsStore, disabledTabs: [...disabledTabs, tabId] });
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16 }}>
      <List>
        {tabs.map((tab) => (
          <Item key={tab.id}>
            <Icon>
              <Papicons name={tab.icon} />
            </Icon>
            <Typography variant="title">{tab.name}</Typography>
            <Trailing>
              <Switch value={tab.enabled} onValueChange={() => toggleTab(tab.id)} />
            </Trailing>
          </Item>
        ))}
      </List>
    </ScrollView>
  )
}

export default SettingsTabs
