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

const SettingsAbout = () => {
  const theme = useTheme()
  const { colors } = theme


  const Items = [
    {
      title: "Donateurs",
      description: "Voir la liste des donateurs",
      leading: <Papicons name="PiggyBank" />,
      onPress: () => console.log("sus"),
    },
    {
      title: "Serveur Discord",
      description: "Rejoindre le serveur Discord",
      leading: <Papicons name="TextBubble" />,
      onPress: () => Linking.openURL('https://go.papillon.bzh/discord'),
    },
    {
      title: "Projet GitHub",
      description: "Contribuer au projet sur GitHub",
      leading: <Papicons name="TextBubble" />,
      onPress: () => Linking.openURL('https://github.com/PapillonApp/Papillon'),
    },
  ];

  const Infos = [
    {
      title: "Version de l'application",
      description: packageJson.version,
      leading: <Papicons name="Butterfly" />,
    },
    {
      title: "Version des dépendances",
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
        color={theme.dark ? "#003A21" : "#003A21" + "50"}
        title="Derrière Papillon"
        description="Papillon est maintenu par des étudiants 100% bénévoles"
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