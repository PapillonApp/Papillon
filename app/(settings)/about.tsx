import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { Github, Languages } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, ScrollView } from "react-native";

import SettingsHeader from "@/components/SettingsHeader";
import packageJson from "@/package.json"
import { useSettingsStore } from "@/stores/settings";
import Avatar from "@/ui/components/Avatar";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { getInitials } from "@/utils/chats/initials";
import { Contributor, getContributors } from "@/utils/github/contributors";

export const Team = [
  {
    title: "Vince Linise",
    description: "Président",
    login: "ecnivtwelve",
    leading: <Avatar size={40} shape="square" initials={getInitials("Vince Linise")} imageUrl="https://avatars.githubusercontent.com/u/32978709?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/vincelinise/")
  },
  {
    title: "Lucas Lavajo",
    description: "Vice-Président",
    login: "tryon-dev",
    leading: <Avatar size={40} shape="square" initials={getInitials("Lucas Lavajo")} imageUrl="https://avatars.githubusercontent.com/u/68423470?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/lucas-lavajo/")
  },
  {
    title: "Raphaël Schröder",
    description: "Trésorier Adjoint",
    login: "raphckrman",
    leading: <Avatar size={40} shape="square" initials={getInitials("Raphaël Schröder")} imageUrl="https://avatars.githubusercontent.com/u/41128238?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/raphckrman/")
  },
  {
    title: "Tom Hélière",
    login: "tom-things",
    description: "Secrétaire",
    leading: <Avatar size={40} shape="square" initials={getInitials("Tom Hélière")} imageUrl="https://avatars.githubusercontent.com/u/135361669?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/tom-heliere/")
  },
  {
    title: "Rémy Godet",
    description: "Secrétaire Adjoint",
    login: "godetremy",
    leading: <Avatar size={40} shape="square" initials={getInitials("Rémy Godet")} imageUrl="https://avatars.githubusercontent.com/u/77058107?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/godetremy/")
  },
  {
    title: "Mael Duret",
    description: "Membre",
    login: "ryzenixx",
    leading: <Avatar size={40} shape="square" initials={getInitials("Mael Duret")} imageUrl="https://avatars.githubusercontent.com/u/96339570?v=4" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/in/mael-duret/")
  }
]

export default function SettingsAbout() {
  const theme = useTheme()

  const { t } = useTranslation();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const [contributors, setContributors] = useState<Contributor[]>([])
  const fetchContributors = async () => {
    const fethedContributors = (await getContributors()).filter(contrib => !Team.map(item => item.login).includes(contrib.login))
    setContributors(fethedContributors)
  }

  useEffect(() => {
    fetchContributors()
  }, [])

  const CommunityLinks = [
    {
      title: t("Settings_Donator"),
      description: t("Settings_Donator_Description"),
      leading: <Papicons name="PiggyBank" />,
      onPress: () => Linking.openURL('https://ko-fi.com/thepapillonapp/leaderboard'),
    },
    {
      title: t("Settings_About_Discord"),
      description: t("Settings_About_Discord_Description"),
      leading: <Papicons name="TextBubble" />,
      onPress: () => Linking.openURL('https://go.papillon.bzh/discord'),
    },
    {
      title: t("Settings_About_Issue"),
      description: t("Settings_About_Issue_Description"),
      leading: <Papicons name="Info" />,
      onPress: () => Linking.openURL('https://github.com/PapillonApp/Papillon/issues'),
    },
  ];

  const DeveloperLinks = [
    {
      title: t("Settings_About_Crowdin"),
      description: t("Settings_About_Crowdin_Description"),
      leading: <Languages />,
      onPress: () => Linking.openURL('https://crowdin.com/project/papillonapp'),
    },
    {
      title: t("Settings_About_Github"),
      description: t("Settings_About_Github_Description"),
      leading: <Github />,
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
      contentContainerStyle={{ padding: 20, gap: 10 }}
      contentInsetAdjustmentBehavior="always"
      showsVerticalScrollIndicator={false}
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
        {Team.map((item, index) => (
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
        {CommunityLinks.map((item, index) => (
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
        {DeveloperLinks.map((item, index) => (
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
              <Avatar size={40} shape="square" initials={getInitials(item.login)} imageUrl={item.avatar_url} />
            </Leading>

            <Typography>{item.login}</Typography>
            <Typography color="secondary">{item.contributions} {item.contributions > 1 ? "contributions" : "contribution"}</Typography>
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
