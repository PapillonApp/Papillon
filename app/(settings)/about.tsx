import { UserX2Icon } from "lucide-react-native";
import React from "react";
import { ScrollView, Text } from "react-native";

import { useAccountStore } from "@/stores/account";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";
import { Papicons } from "@getpapillon/papicons";
import SettingsHeader from "@/components/SettingsHeader";

const SettingsAbout = () => {
  const theme = useTheme()
  const { colors } = theme

  const Items = [
    {
      title: "Donateurs",
      description: "Voir la liste des donateurs",
      leading: "PiggyBank",
      onPress: () => console.log("sus"),
    },
    {
      title: "Serveur Discord",
      description: "Rejoindre le serveur Discord",
      leading: "TextBubble",
      onPress: () => console.log("sus"),
    },
    {
      title: "Projet GitHub",
      description: "Contribuer au projet sur GitHub",
      leading: "TextBubble",
      onPress: () => console.log("sus"),
    },
  ];

  const Infos = [
    {
      title: "Version",
      description: "Voir la liste des donateurs",
      leading: "PiggyBank",
      onPress: () => console.log("sus"),
    },
    {
      title: "Serveur Discord",
      description: "Rejoindre le serveur Discord",
      leading: "TextBubble",
      onPress: () => console.log("sus"),
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20 }}
      contentInsetAdjustmentBehavior="always"
    >
      <SettingsHeader
        color={theme.dark ? "#003A21" : "#003A21"}
        title="Derrière Papillon"
        description="Papillon est maintenu par des étudiants 100% bénévoles"
        imageSource={require("@/assets/images/logoabout.png")}
      />
      <List>
        {Items.map((item, index) => (
          <Item
            key={index}
            onPress={item.onPress}
          >
            <Leading>
              <Icon>
                <Papicons name={item.leading} />
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
                <Papicons name={item.leading} />
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