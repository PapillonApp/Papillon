import { Papicons } from "@getpapillon/papicons";
import * as PapillonKit from "@getpapillon/papillonkit";
import { router } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { FadeIn, FadeOut } from "react-native-reanimated";

import AppColorsSelector from "@/components/AppColorsSelector";
import { useAccountStore } from "@/stores/account";
import { DEFAULT_MATERIAL_YOU_ENABLED, useSettingsStore } from "@/stores/settings";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Picker from "@/ui/components/Picker";
import Stack from "@/ui/components/Stack";
import NativeSwitch from "@/ui/native/NativeSwitch";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { AppColors } from "@/utils/colors";
import { getGradeDisplayScale } from "@/utils/grades/scale";
import { trackOptionalEvent } from "@/utils/logger/analytics";

const FONT_OPTIONS = [
  { label: "SN Pro", value: "sn-pro" as const },
  { label: "Fixel Text", value: "fixel-text" as const },
  { label: "Oxanium", value: "oxanium" as const },
  { label: "Courgette", value: "courgette" as const },
  { label: "IBM Plex Serif", value: "ibm-plex-serif" as const },
];

const GRADE_SCALE_OPTIONS = [
  { label: "Note sur 20", value: "20" as const },
  { label: "Note sur 10", value: "10" as const },
  { label: "Note sur 5", value: "5" as const },
  { label: "Pourcentage", value: "percentage" as const },
];

const PersonalizationSettings = () => {
  const theme = useTheme();
  const { t } = useTranslation()

  const store = useAccountStore.getState();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const useMaterialYou = settingsStore.useMaterialYou ?? DEFAULT_MATERIAL_YOU_ENABLED;
  const liveActivitiesEnabled = settingsStore.liveActivitiesEnabled ?? true;
  const selectedGradeScale = getGradeDisplayScale(settingsStore.gradesDisplayScale);
  const selectedGradeScaleIndex = useMemo(() => {
    return Math.max(0, GRADE_SCALE_OPTIONS.findIndex(option => option.value === selectedGradeScale));
  }, [selectedGradeScale]);
  const selectedFontFamily = settingsStore.fontFamily ?? "sn-pro";
  const selectedFontIndex = Math.max(
    FONT_OPTIONS.findIndex(option => option.value === selectedFontFamily),
    0
  );

  const defaultColorData = AppColors.find(color => color.colorEnum === settingsStore.colorSelected) || AppColors[0];
  const [selectedColor, setSelectedColor] = React.useState<string>(defaultColorData.mainColor);
  const [selectedTheme, setSelectedTheme] = React.useState<"light" | "dark" | "auto">("auto");

  const height = useHeaderHeight()

  useEffect(() => {
    if (settingsStore.theme) {
      setSelectedTheme(settingsStore.theme);
    }
  }, []);

  useEffect(() => {
    mutateProperty('personalization', { theme: selectedTheme });
  }, [selectedTheme]);

  return (
    <>
      <Dynamic animated entering={FadeIn} exiting={FadeOut} key={'color-grad-stgs:' + theme.colors.primary}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary + "00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 400,
            opacity: useMaterialYou ? 0.4 : 1,
          }}
        />
      </Dynamic>
      <List
        safeHorizontalPadding={16}
        contentContainerStyle={{ paddingVertical: 16 }}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, paddingTop: Platform.OS === "android" ? height : 0, backgroundColor: theme.colors.overground }}
      >
        {!useMaterialYou &&
          <List.Section>
            <List.SectionTitle>
              <List.Label>Choix de la couleur</List.Label>
            </List.SectionTitle>
            <List.View>
              <AppColorsSelector
                onChangeColor={(color: string) => {
                  setSelectedColor(color);
                  setTimeout(() => {
                    const colorData = AppColors.find(appColor => appColor.mainColor === color);
                    if (colorData) {
                      mutateProperty('personalization', {
                        colorSelected: colorData.colorEnum
                      });
                    }
                  }, 50);
                }}
                accountId={store.lastUsedAccount}
              />
            </List.View>
          </List.Section>
        }

        <List.Section>
          <List.SectionTitle>
            <List.Label>Options du thème</List.Label>
          </List.SectionTitle>
          {Platform.OS === "android" && Platform.Version >= 31 && (
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name={"Palette"} />
                </Icon>
              </List.Leading>
              <Typography variant="caption" color={"primary"}>{t("Global_Recommended")}</Typography>
              <Typography variant="title">{t("Settings_Personalization_MaterialYou_Title")}</Typography>
              <Typography variant="body1" color="textSecondary">
                {t("Settings_Personalization_MaterialYou_Description")}
              </Typography>
              <List.Trailing>
                <NativeSwitch
                  value={useMaterialYou}
                  onValueChange={(value) => {
                    mutateProperty("personalization", { useMaterialYou: value });
                  }}
                  disabled={typeof Platform.Version !== "number" || Platform.Version < 31}
                />
              </List.Trailing>
            </List.Item>
          )}
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"ColorTheme"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Settings_Personalization_Theme")}</Typography>
            <List.Trailing>
              <Stack bordered={true}
                direction={"horizontal"}
                height={40}
                hAlign={"center"}
                vAlign={"center"}
              >
                <AnimatedPressable onPress={() => {
                  if (selectedTheme !== "light") {
                    trackOptionalEvent("color_theme_changed", { theme: "light" });
                  }
                  setSelectedTheme("light");
                }}
                  style={{ overflow: "hidden", height: "100%" }}
                >
                  <Stack style={{ overflow: "hidden", paddingHorizontal: 15, height: "100%" }}
                    hAlign={"center"}
                    vAlign={"center"}
                    backgroundColor={selectedTheme === "light" ? theme.colors.primary : "transparent"}
                    radius={20}
                  >
                    <Papicons name={"Sun"}
                      opacity={selectedTheme === "light" ? 1 : 0.7}
                      color={selectedTheme === "light" ? "#FFF" : theme.colors.text}
                    />
                  </Stack>
                </AnimatedPressable>
                <AnimatedPressable onPress={() => {
                  if (selectedTheme !== "dark") {
                    trackOptionalEvent("color_theme_changed", { theme: "dark" });
                  }
                  setSelectedTheme("dark");
                }}
                  style={{ overflow: "hidden", height: "100%" }}
                >
                  <Stack style={{ overflow: "hidden", paddingHorizontal: 15, height: "100%" }}
                    hAlign={"center"}
                    vAlign={"center"}
                    backgroundColor={selectedTheme === "dark" ? theme.colors.primary : "transparent"}
                    radius={20}
                  >
                    <Papicons name={"Moon"}
                      opacity={selectedTheme === "dark" ? 1 : 0.7}
                      color={selectedTheme === "dark" ? "#FFF" : theme.colors.text}
                    />
                  </Stack>
                </AnimatedPressable>
                <AnimatedPressable onPress={() => {
                  if (selectedTheme !== "auto") {
                    trackOptionalEvent("color_theme_changed", { theme: "auto" });
                  }
                  setSelectedTheme("auto");
                }}
                  style={{ overflow: "hidden", height: "100%" }}
                >
                  <Stack style={{ overflow: "hidden", paddingHorizontal: 15, height: "100%" }}
                    hAlign={"center"}
                    vAlign={"center"}
                    backgroundColor={selectedTheme === "auto" ? theme.colors.primary : "transparent"}
                    radius={20}
                  >
                    <Typography color={selectedTheme === "auto" ? "#FFF" : theme.colors.text + "7F"}>Auto</Typography>
                  </Stack>
                </AnimatedPressable>
              </Stack>
            </List.Trailing>
          </List.Item>
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"Palette"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">Police</Typography>
            <Typography variant="body1" color="textSecondary">
              Modifier la police de caractères
            </Typography>
            <List.Trailing>
              <Picker
                options={FONT_OPTIONS.map(option => option.label)}
                selectedIndex={selectedFontIndex}
                onValueChange={(index) => {
                  const option = FONT_OPTIONS[index];
                  if (!option) return;
                  mutateProperty("personalization", { fontFamily: option.value });
                }}
              />
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <List.Label>Options des matières</List.Label>
          </List.SectionTitle>
          <List.Item
            onPress={() => {
              router.push("/(settings)/subject_personalization");
            }}
          >
            <List.Leading>
              <Icon>
                <Papicons name={"PenAlt"} />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Settings_Personalization_Subject_Title")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {t("Settings_Personalization_Subject_Description")}
            </Typography>
            <List.Trailing>
              <Icon>
                <Papicons name="ChevronRight" opacity={0.7} />
              </Icon>
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <List.Label>Options de l'application</List.Label>
          </List.SectionTitle>
          <List.Item
            onPress={() => {
              router.push("/(settings)/tabs");
            }}
          >
            <List.Leading>
              <Icon>
                <Papicons name={"PapillonApp"} />
              </Icon>
            </List.Leading>
            <Typography variant={"title"}>{t("Settings_Tabs_Title")}</Typography>
            <Typography variant={"body1"}
              color={"textSecondary"}
            >{t("Settings_Tabs_Description")}</Typography>
            <List.Trailing>
              <Icon>
                <Papicons name="ChevronRight" opacity={0.7} />
              </Icon>
            </List.Trailing>
          </List.Item>
          <List.Item
            onPress={() => {
              router.push("/(settings)/language");
            }}
          >
            <List.Leading>
              <Icon>
                <Papicons name={"MapPin"} />
              </Icon>
            </List.Leading>
            <Typography variant={"title"}>{t("Settings_Language_Title")}</Typography>
            <Typography variant={"body1"}
              color={"textSecondary"}
            >{t("Settings_Language_Description")}</Typography>
            <List.Trailing>
              <Icon>
                <Papicons name="ChevronRight" opacity={0.7} />
              </Icon>
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Settings_Features_Grades")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name={"Grades"} />
              </Icon>
            </List.Leading>
            <Typography variant="body2" color="primary">{t("Global_Experimental")}</Typography>
            <Typography variant="title">{t("Settings_Features_GradeScale")}</Typography>
            <Typography color="textSecondary" numberOfLines={2}>
              {t("Settings_Features_GradeScale_Description")}
            </Typography>
            <List.Trailing>
              <View style={{ width: 120, alignItems: "flex-end" }}>
                <Picker
                  options={GRADE_SCALE_OPTIONS.map(option => option.label)}
                  selectedIndex={selectedGradeScaleIndex}
                  onValueChange={(index) => {
                    const option = GRADE_SCALE_OPTIONS[index];
                    if (!option) {
                      return;
                    }
                    mutateProperty("personalization", {
                      gradesDisplayScale: option.value,
                    });
                  }}
                />
              </View>
            </List.Trailing>
          </List.Item>
        </List.Section>

        {PapillonKit.features.liveActivities && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Settings_Features_LockScreen")}</List.Label>
            </List.SectionTitle>

            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name={"Clock"} />
                </Icon>
              </List.Leading>
              <Typography variant="title">{t("Settings_Features_LiveActivities")}</Typography>
              <Typography color="textSecondary" numberOfLines={3}>
                {t("Settings_Features_LiveActivities_Description")}
              </Typography>
              <List.Trailing>
                <NativeSwitch
                  value={liveActivitiesEnabled}
                  onValueChange={(value) =>
                    mutateProperty("personalization", {
                      liveActivitiesEnabled: value,
                    })
                  }
                />
              </List.Trailing>
            </List.Item>
          </List.Section>
        )}
      </List>
    </>
  )
};

export default PersonalizationSettings;
