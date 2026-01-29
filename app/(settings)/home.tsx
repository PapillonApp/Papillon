import { Papicons } from "@getpapillon/papicons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch, View } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Icon from "@/ui/components/Icon";
import Item, { Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";

const SettingsHome = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const disabledWidgets = settingsStore?.disabledWidgets || [];
  const maxCoursesOnHome = settingsStore?.maxCoursesOnHome || 3;

  const [localMaxCoursesOnHome, setLocalMaxCoursesOnHome] = useState(maxCoursesOnHome);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      mutateMaxCoursesOnHomes();
    });

    return unsubscribe;
  }, [navigation, localMaxCoursesOnHome, maxCoursesOnHome]);
  

  const mutateMaxCoursesOnHomes = () => {
    mutateProperty("personalization", {...settingsStore, maxCoursesOnHome: localMaxCoursesOnHome});
  }
    
  const onIncreaseMaxCourses = () => {
    setLocalMaxCoursesOnHome(localMaxCoursesOnHome + 1)
  }

  const onDecreaseMaxCourses = () => {
    if (localMaxCoursesOnHome > 1) {
      setLocalMaxCoursesOnHome(localMaxCoursesOnHome - 1)
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12 }}>
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

      <List>
        <Item>
          <Icon>
            <Papicons name="calendar" />
          </Icon>

          <Typography variant="title">{t("Settings_Home_MaxCourses")}</Typography>
          
          <Trailing>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <AnimatedPressable scaleTo={0.8} onPress={onIncreaseMaxCourses}>
                <Icon>
                  <Papicons name="plus" />
                </Icon>
              </AnimatedPressable>

              <Typography variant="title">{localMaxCoursesOnHome}</Typography>

              <AnimatedPressable scaleTo={0.8} onPress={onDecreaseMaxCourses}>
                <Icon>
                  <Papicons name="minus" />
                </Icon>
              </AnimatedPressable>
            </View>
          </Trailing>
        </Item>
      </List>
    </ScrollView>
  )
}

export default SettingsHome;