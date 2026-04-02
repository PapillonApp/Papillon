import { Alert, Platform, ScrollView, Switch } from "react-native";
import Stack from "@/ui/components/Stack";
import { EarthIcon } from "lucide-react-native";
import React, { useEffect } from "react";
import Typography from "@/ui/new/Typography";
import Icon from "@/ui/components/Icon";
import { Papicons, PapillonApp } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useTheme } from "@react-navigation/native";
import AppColorsSelector from "@/components/AppColorsSelector";
import { AppColors } from "@/utils/colors";
import LinearGradient from "react-native-linear-gradient";
import adjust from "@/utils/adjustColor";
import { useAccountStore } from "@/stores/account";
import { DEFAULT_MATERIAL_YOU_ENABLED, useSettingsStore } from "@/stores/settings";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { Dynamic } from "@/ui/components/Dynamic";
import { FadeIn, FadeOut } from "react-native-reanimated";
import List from "@/ui/new/List";


const PersonalizationSettings = () => {
  const theme = useTheme();
  const { t } = useTranslation()

  const store = useAccountStore.getState();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const useMaterialYou = settingsStore.useMaterialYou ?? DEFAULT_MATERIAL_YOU_ENABLED;

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
            opacity: useMaterialYou ? 0.3 : 1,
          }}
        />
      </Dynamic>
      <List
        contentContainerStyle={{ padding: 16 }}
        contentInsetAdjustmentBehavior="always"
        style={{ flex: 1, paddingTop: Platform.OS === "android" ? height : 0 }}
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
              <Typography variant="title">{t("Settings_Personalization_MaterialYou_Title")}</Typography>
              <Typography variant="body1" color="textSecondary">
                {t("Settings_Personalization_MaterialYou_Description")}
              </Typography>
              <List.Trailing>
                <Switch
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
                <AnimatedPressable onPress={() => setSelectedTheme("light")}
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
                <AnimatedPressable onPress={() => setSelectedTheme("dark")}
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
                <AnimatedPressable onPress={() => setSelectedTheme("auto")}
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
      </List>
    </>
  )
};

export default PersonalizationSettings;
