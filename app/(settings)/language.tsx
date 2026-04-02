import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { resources } from "@/utils/i18n";

const LanguagePersonalization = () => {
  const { i18n } = useTranslation();
  const { colors } = useTheme();

  const settingStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const languages = Object.keys(resources).map(key => ({
    id: key,
    name: resources[key].label,
    emoji: resources[key].emoji,
  }));

  const rtlLanguages = ["ar", "he", "fa", "ur"];

  const setLanguage = (lang: string) => {
    requestAnimationFrame(() => {
      if (rtlLanguages.includes(lang)) {
        Alert.alert(
          "Inverted layout is not supported yet",
          "The selected language may not be displayed correctly."
        );
      }

      setTimeout(() => {
        i18n.changeLanguage(lang);
        mutateProperty("personalization", { ...settingStore, language: lang });
      }, 90);
    });
  };

  return (
    <List
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior="always"
    >
      {languages.map(lang => {
        const isSelected = i18n.language === lang.id;

        return (
          <List.Item
            key={lang.id}
            onPress={() => {
              setLanguage(lang.id);
            }}
          >
            <List.Leading>
              <Typography>{lang.emoji}</Typography>
            </List.Leading>

            <Typography
              variant="title"
              weight={isSelected ? "bold" : "medium"}
              style={{
                paddingVertical: Platform.OS === "android" ? 4 : 2,
              }}
            >
              {lang.name}
            </Typography>

            {isSelected && (
              <List.Trailing>
                <Icon size={22} papicon>
                  <Papicons name={"Check"} color={colors.primary} />
                </Icon>
              </List.Trailing>
            )}
          </List.Item>
        );
      })}
    </List>
  );
};

export default LanguagePersonalization;
