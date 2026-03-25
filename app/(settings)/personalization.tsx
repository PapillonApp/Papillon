import { Alert, Platform, ScrollView } from "react-native";
import Stack from "@/ui/components/Stack";
import { EarthIcon } from "lucide-react-native";
import React, { useEffect } from "react";
import List from "@/ui/components/List";
import Item, { Trailing } from "@/ui/components/Item";
import Typography from "@/ui/components/Typography";
import Icon from "@/ui/components/Icon";
import { Papicons, PapillonApp } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useTheme } from "@react-navigation/native";
import AppColorsSelector from "@/components/AppColorsSelector";
import { AppColors } from "@/utils/colors";
import LinearGradient from "react-native-linear-gradient";
import adjust from "@/utils/adjustColor";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { Dynamic } from "@/ui/components/Dynamic";
import { FadeIn, FadeOut } from "react-native-reanimated";


const PersonalizationSettings = () => {
  const theme = useTheme();
  const { t } = useTranslation()

  const store = useAccountStore.getState();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

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
      <Dynamic animated entering={FadeIn} exiting={FadeOut} key={'color-grad-stgs:' + selectedColor}>
        <LinearGradient
          colors={[selectedColor + "50", selectedColor + "00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 400,
          }}
        />
      </Dynamic>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        contentInsetAdjustmentBehavior="always"
        style={{ flex: 1, paddingTop: Platform.OS === "android" ? height : 0 }}
      >
        <Stack direction="horizontal"
          gap={10}
          vAlign="start"
          hAlign="center"
          style={{
            paddingHorizontal: 6,
            paddingVertical: 0,
            marginBottom: 10,
            opacity: 0.5,
          }}
        >
          <Icon>
            <Papicons
              name={"Palette"}
              size={18}
              color={adjust(selectedColor, theme.dark ? 0.8 : -0.6)}
            />
          </Icon>
          <Typography color={adjust(selectedColor, theme.dark ? 0.8 : -0.6)} weight={"semibold"}>
            {t("Settings_Personalization_Accent")}
          </Typography>
        </Stack>
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
        <Typography
          style={{ paddingTop: 10, flex: 1 }}
          color="#7F7F7F"
          variant="caption"
        >
          {t("Settings_Personalization_Accent_Description")}
        </Typography>
        <List style={{ marginTop: 15 }}>
          <Item>
            <Icon size={30}>
              <Papicons name={"ColorTheme"}
                opacity={0.7}
              />
            </Icon>
            <Typography variant={"title"}>{t("Settings_Personalization_Theme")}</Typography>
            <Trailing>
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
                    backgroundColor={selectedTheme === "light" ? selectedColor : "transparent"}
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
                    backgroundColor={selectedTheme === "dark" ? selectedColor : "transparent"}
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
                    backgroundColor={selectedTheme === "auto" ? selectedColor : "transparent"}
                    radius={20}
                  >
                    <Typography color={selectedTheme === "auto" ? "#FFF" : theme.colors.text + "7F"}>Auto</Typography>
                  </Stack>
                </AnimatedPressable>
              </Stack>
            </Trailing>
          </Item>
          {/*
          <Item onPress={() => {
            Alert.alert("Ça arrive... ✨", "Cette fonctionnalité n'est pas encore disponible.")
          }}
          >
            <Icon size={30}>
              <Papicons name={"PapillonApp"}
                opacity={0.7}
              />
            </Icon>
            <Typography variant={"title"}>{t("Settings_Personalization_Icon_Title")}</Typography>
            <Typography variant={"caption"}
              color={"secondary"}
            >{t("Settings_Personalization_Icon_Description")}</Typography>
          </Item>
          */}
          <Item
            onPress={() => {
              router.push("/(settings)/subject_personalization");
            }}
          >
            <Icon size={30}>
              <Papicons name={"PenAlt"}
                opacity={0.7}
              />
            </Icon>
            <Typography variant={"title"}>{t("Settings_Personalization_Subject_Title")}</Typography>
            <Typography variant={"caption"}
              color={"secondary"}
            >{t("Settings_Personalization_Subject_Description")}</Typography>
          </Item>
        </List>
        <List>
          <Item
            onPress={() => {
              router.push("/(settings)/tabs");
            }}
          >
            <Icon size={30}>
              <Papicons name={"PapillonApp"} color="#818181" />
            </Icon>
            <Typography variant={"title"}>{t("Settings_Tabs_Title")}</Typography>
            <Typography variant={"caption"}
              color={"secondary"}
            >{t("Settings_Tabs_Description")}</Typography>
            <Trailing>
              <Icon>
                <Papicons name="ChevronRight" color="#818181" />
              </Icon>
            </Trailing>
          </Item>
          <Item
            onPress={() => {
              router.push("/(settings)/language");
            }}
          >
            <Icon size={30}>
              <EarthIcon width={25} height={25} stroke="#818181" />
            </Icon>
            <Typography variant={"title"}>{t("Settings_Language_Title")}</Typography>
            <Typography variant={"caption"}
              color={"secondary"}
            >{t("Settings_Language_Description")}</Typography>
            <Trailing>
              <Icon>
                <Papicons name="ChevronRight" color="#818181" />
              </Icon>
            </Trailing>
          </Item>
        </List>
      </ScrollView>
    </>
  );
};

export default PersonalizationSettings;