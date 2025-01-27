import React from "react";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { Image, ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  NativeItem,
  NativeList,
  NativeText,
  NativeListHeader,
} from "@/components/Global/NativeComponents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import languageList from "@/lang/languagesList.json";

const typedLanguageList:any = languageList;

const SettingsLanguage: Screen<"SettingsLanguage"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t, i18n } = useTranslation();

  navigation.setOptions({
    headerTitle: t("settings.sections.customization.language.title"),
  });

  const languages = Object.keys(i18n.services.resourceStore.data).reduce(
    (acc, lng) => {
      acc[lng] = i18n.getResource(lng, "translation", "languageName");
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <View>
        <NativeListHeader
          label={t("settings.sections.customization.language.title")}
        />
        <NativeList>
          {Object.entries(languages).map(([lng]) => (
            <NativeItem
              key={lng}
              onPress={() => {
                i18n.changeLanguage(lng);
                AsyncStorage.setItem("lang", lng);
              }}
              leading={
                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <PapillonCheckbox
                    checked={i18n.language === lng}
                    onPress={() => {
                      i18n.changeLanguage(lng);
                      AsyncStorage.setItem("lang", lng);
                    }}
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
              <View
                style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
              >
                <Image
                  source={{
                    uri: `https://flagsapi.com/${
                      typedLanguageList[lng]?.countryCode
                        ? (typedLanguageList[lng]?.countryCode).toUpperCase()
                        : lng.toUpperCase()
                    }/shiny/64.png`,
                  }}
                  style={{ width: 32, height: 32 }}
                />
                <NativeText>{typedLanguageList[lng].nativeName}</NativeText>
                <NativeText style={{ color: colors.text + "80" }}>|</NativeText>
                <NativeText
                  style={{
                    color: colors.text + "80",
                  }}
                >
                  {typedLanguageList[lng].name}
                </NativeText>
              </View>
            </NativeItem>
          ))}
        </NativeList>
      </View>
    </ScrollView>
  );
};

export default SettingsLanguage;
