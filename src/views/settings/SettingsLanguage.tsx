import React from "react";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { NativeItem, NativeList, NativeText, NativeListHeader } from "@/components/Global/NativeComponents";

const SettingsLanguage: Screen<"SettingsLanguage"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t, i18n } = useTranslation();

  navigation.setOptions({
    headerTitle: t("settings.sections.customization.language.title"),
  });

  const languages = Object.keys(i18n.services.resourceStore.data).reduce((acc, lng) => {
    acc[lng] = i18n.getResource(lng, "translation", "languageName");
    return acc;
  }, {} as Record<string, string>);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <View>
        <NativeListHeader label={t("settings.sections.customization.language.title")} />
        <NativeList>
          {Object.entries(languages).map(([lng, name]) => (
            <NativeItem
              key={lng}
              onPress={() => {
                i18n.changeLanguage(lng);
              }}
              leading={
                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                  style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                >
                  <PapillonCheckbox
                    checked={i18n.language === lng}
                    onPress={() => i18n.changeLanguage(lng)}
                    style={{ marginRight: 1 }}
                  />
                </Reanimated.View>
              }
              style={{
                backgroundColor: colors.card,
                padding: 16,
                borderRadius: 8,
                marginBottom: 8,
              }}
              chevron={false}
            >
              <NativeText>{name}</NativeText>
            </NativeItem>
          ))}
        </NativeList>
      </View>
    </ScrollView>
  );
};

export default SettingsLanguage;
