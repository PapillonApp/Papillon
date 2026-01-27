import { Papicons } from "@getpapillon/papicons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import Item, { Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";

const SettingsHome = () => {
  const { t } = useTranslation();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const disabledTabs = settingsStore?.disabledTabs || [];

  const tabs = [
    {
      id: "calendar",
      name: t("Home_Widget_NextCourses"),
      icon: "calendar",
      enabled: !disabledTabs.includes("calendar"),
    },
    {
      id: "grades",
      name: t("Home_Widget_NewGrades"),
      icon: "grades",
      enabled: !disabledTabs.includes("grades"),
    },
    {
      id: "tasks",
      name: t("Home_Widget_NewTasks"),
      icon: "tasks",
      enabled: !disabledTabs.includes("tasks"),
    },
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

export default SettingsHome;