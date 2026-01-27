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

  const disabledWidgets = settingsStore?.disabledWidgets || [];

  const widgets = [
    {
      id: "calendar",
      name: t("Home_Widget_NextCourses"),
      icon: "calendar",
      enabled: !disabledWidgets.includes("calendar"),
    },
    {
      id: "grades",
      name: t("Home_Widget_NewGrades"),
      icon: "grades",
      enabled: !disabledWidgets.includes("grades"),
    },
    {
      id: "tasks",
      name: t("Home_Widget_NewTasks"),
      icon: "tasks",
      enabled: !disabledWidgets.includes("tasks"),
    },
  ]

  const toggleWidget = (widgetId: string) => {
    if (disabledWidgets.includes(widgetId)) {
      mutateProperty("personalization", { ...settingsStore, disabledWidgets: disabledWidgets.filter(id => id !== widgetId) });
    } else {
      mutateProperty("personalization", { ...settingsStore, disabledWidgets: [...disabledWidgets, widgetId] });
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16 }}>
      <List>
        {widgets.map((widget) => (
          <Item key={widget.id}>
            <Icon>
              <Papicons name={widget.icon} />
            </Icon>
            <Typography variant="title">{widget.name}</Typography>
            <Trailing>
              <Switch value={widget.enabled} onValueChange={() => toggleWidget(widget.id)} />
            </Trailing>
          </Item>
        ))}
      </List>
    </ScrollView>
  )
}

export default SettingsHome;