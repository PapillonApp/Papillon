import React from "react";
import { ScrollView } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const SettingsLanguage: Screen<"SettingsLanguage"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  navigation.setOptions({
    headerTitle: t("settings.sections.general.language.title"),
  });

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >

    </ScrollView>
  );
};

export default SettingsLanguage;
