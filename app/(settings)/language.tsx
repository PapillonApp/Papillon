import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { resources } from "@/utils/i18n";

const LanguagePersonalization = () => {
  const { i18n } = useTranslation();
  const { colors } = useTheme();

  const settingStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const languages = Object.keys(resources).map((key) => ({
    id: key,
    name: resources[key].label,
    emoji: resources[key].emoji
  }));

  const rtlLanguages = ["ar", "he", "fa", "ur"];

  const setLanguage = (lang: string) => {
    requestAnimationFrame(() => {
      if (rtlLanguages.includes(lang)) {
        Alert.alert("Inverted layout is not supported yet", "The selected language may not be displayed correctly.");
      }

      setTimeout(() => {
        i18n.changeLanguage(lang);
        mutateProperty("personalization", { ...settingStore, language: lang });
      }, 90);
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}

    >
      <List>
        {languages.map((lang) => {
          const isSelected = i18n.language === lang.id;

          return (
            <Item
              key={lang.id}
              onPress={() => {
                setLanguage(lang.id);
              }}
            >
              <Leading>
                <Typography>
                  {lang.emoji}
                </Typography>

              </Leading>

              <Typography
                variant={"title"}
                style={{
                  flex: 1,
                  fontWeight: isSelected ? "bold" : "normal"
                }}
              >
                {lang.name}
              </Typography>

              {isSelected && (
                <Trailing>
                  <Icon size={22} papicon>
                    <Papicons name={"Check"} color={colors.primary} />
                  </Icon>
                </Trailing>

              )}
            </Item>
          );
        })}
      </List>
    </ScrollView>
  );
};

export default LanguagePersonalization;