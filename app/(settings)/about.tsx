import { UserX2Icon } from "lucide-react-native";
import React from "react";
import { Linking, ScrollView, Text } from "react-native";

import { useAccountStore } from "@/stores/account";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import SettingsHeader from "@/components/SettingsHeader";
import packageJson from "@/package.json"
import { useTranslation } from "react-i18next";

const SettingsAbout = () => {
  const theme = useTheme()
  const { colors } = theme

  const { t } = useTranslation();

  const Items = [
    {
      title: t("Settings_Donator"),
      description: t("Settings_Donator_Description"),
      leading: <Papicons name="PiggyBank" />,
      onPress: () => console.log("sus"),
    },
    {
      title: t("Settings_About_Discord"),
      description: t("Settings_About_Discord_Description"),
      leading: <Papicons name="TextBubble" />,
      onPress: () => Linking.openURL('https://go.papillon.bzh/discord'),
    },
    {
      title: t("Settings_About_Github"),
      description: t("Settings_About_Github_Description"),
      leading: <Papicons name="Ghost" />,
      onPress: () => Linking.openURL('https://github.com/PapillonApp/Papillon'),
    },
  ];

  const Infos = [
    {
      title: t("Settings_App_Version"),
      description: packageJson.version,
      leading: <Papicons name="Butterfly" />,
    },
    {
      title: t("Settings_About_Dependency_Version"),
      description: `Expo: ${packageJson.dependencies?.expo || "N/A"} | RN: ${packageJson.dependencies?.["react-native"] || "N/A"}`,
      leading: <Papicons name="Code" />,
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20 }}
      contentInsetAdjustmentBehavior="always"
    >
      <SettingsHeader
        color={theme.dark ? "#121e2a" : "#dfebf7"}
        title={t('Settings_About_Papillion_Behind')}
        description={t('Settings_About_Papillion_Behind_Description')}
        imageSource={require("@/assets/images/about_papillon.png")}
        disableMargin
        height={270}
      />
      <List>
        {Items.map((item, index) => (
          <Item
            key={index}
            onPress={item.onPress}
          >
            <Leading>
              <Icon>
                {item.leading}
              </Icon>
            </Leading>
            <Typography variant="title">
              {item.title}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.description}
            </Typography>
            <Trailing>
              <Icon>
                <Papicons name="ChevronRight" />
              </Icon>
            </Trailing>
          </Item>
        ))}
      </List>
      <List>
        {Infos.map((item, index) => (
          <Item
            key={index}
            onPress={item.onPress}
          >
            <Leading>
              <Icon>
                {item.leading}
              </Icon>
            </Leading>
            <Typography variant="title">
              {item.title}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.description}
            </Typography>
          </Item>
        ))}
      </List>
    </ScrollView>
  );
}

export default SettingsAbout;