import { UserX2Icon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text } from "react-native";

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
import { Avatar } from "../(features)/(news)/news";
import { Contributor, getContributors } from "@/utils/github/contributors";

export const Teams = [
  {
    title: "Vince Linise",
    description: "Président",
    login: "ecnivtwelve",
    leading: <Avatar size={40} squared author="Vince Linise" imageURL="https://avatars.githubusercontent.com/u/32978709?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/vincelinise/")
  },
  {
    title: "Lucas Lavajo",
    description: "Vice-Président",
    login: "tryon-dev",
    leading: <Avatar size={40} squared author="Lucas Lavajo" imageURL="https://avatars.githubusercontent.com/u/68423470?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/lucas-lavajo/")
  },
  {
    title: "Raphaël Schröder",
    description: "Trésorier Adjoint",
    login: "raphckrman",
    leading: <Avatar size={40} squared author="Raphaël Schröder" imageURL="https://avatars.githubusercontent.com/u/41128238?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/raphckrman/")
  },
  {
    title: "Tom Hélière",
    login: "tom-things",
    description: "Secrétaire",
    leading: <Avatar size={40} squared author="Tom Hélière" imageURL="https://pbs.twimg.com/profile_images/1943622137849294848/pzD1Fu1-_400x400.jpg" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/tom-heliere/")
  },
  {
    title: "Rémy Godet",
    description: "Secrétaire Adjoint",
    login: "godetremy",
    leading: <Avatar size={40} squared author="Rémy Godet" imageURL="https://avatars.githubusercontent.com/u/77058107?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/godetremy/")
  }
]

import { useSettingsStore } from "@/stores/settings";

export default function SettingsAbout() {
  const theme = useTheme()
  const { colors } = theme

  const { t } = useTranslation();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const [contributors, setContributors] = useState<Contributor[]>([])
  const fetchContributors = async () => {
    const fethedContributors = (await getContributors()).filter(contrib => !Teams.map(item => item.login).includes(contrib.login))
    setContributors(fethedContributors)
  }

  useEffect(() => {
    fetchContributors()
  }, [])

  const Items = [
    {
      title: t("Settings_Donator"),
      description: t("Settings_Donator_Description"),
      leading: <Papicons name="PiggyBank" />,
      onPress: () => Alert.alert("Ça arrive... ✨", "Cette fonctionnalité n'est pas encore disponible."),
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

  const [tapCount, setTapCount] = React.useState(0);

  const handleVersionTap = () => {
    setTapCount(prev => prev + 1);
    if (tapCount + 1 >= 8) {
      setTapCount(0);
      if (settingsStore.showDevMode) {
        Alert.alert("Dev Mode", "Dev mode désactivé!");
        mutateProperty("personalization", { showDevMode: false });
      } else {
        Alert.alert("Dev Mode", "Dev mode activé!");
        mutateProperty("personalization", { showDevMode: true });
      }
    }
  };

  const Infos = [
    {
      title: t("Settings_App_Version"),
      description: packageJson.version,
      leading: <Papicons name="Butterfly" />,
      onPress: handleVersionTap,
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
        {Teams.map((item, index) => (
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
        {contributors.map(item => (
          <Item key={item.login} onPress={() => Linking.openURL(item.html_url)}>
            <Leading>
              <Avatar size={40} squared author={item.login} imageURL={item.avatar_url} />
            </Leading>
            <Typography>{item.login}</Typography>
            <Typography color="secondary">{item.contributions} contributions</Typography>
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