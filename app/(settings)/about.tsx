import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Github, Languages, Users } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";

import SettingsHeader from "@/components/SettingsHeader";
import packageJson from "@/package.json";
import { useSettingsStore } from "@/stores/settings";
import Avatar from "@/ui/components/Avatar";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getInitials } from "@/utils/chats/initials";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Team = [
  {
    title: "Vince Linise",
    description: "Président",
    login: "ecnivtwelve",
    leading: (
      <Avatar
        size={40}
        shape="square"
        initials={getInitials("Vince Linise")}
        imageUrl="https://avatars.githubusercontent.com/u/32978709?v=4"
      />
    ),
    onPress: () => Linking.openURL("https://www.linkedin.com/in/vincelinise/"),
  },
  {
    title: "Lucas Lavajo",
    description: "Vice-Président",
    login: "tryon-dev",
    leading: (
      <Avatar
        size={40}
        shape="square"
        initials={getInitials("Lucas Lavajo")}
        imageUrl="https://avatars.githubusercontent.com/u/68423470?v=4"
      />
    ),
    onPress: () => Linking.openURL("https://www.linkedin.com/in/lucas-lavajo/"),
  },
  {
    title: "Raphaël Schröder",
    description: "Développeur back-end",
    login: "raphckrman",
    leading: (
      <Avatar
        size={40}
        shape="square"
        initials={getInitials("Raphaël Schröder")}
        imageUrl="https://avatars.githubusercontent.com/u/41128238?v=4"
      />
    ),
    onPress: () => Linking.openURL("https://www.linkedin.com/in/raphckrman/"),
  },
  {
    title: "Tom Hélière",
    login: "tom-things",
    description: "Designer UI/UX",
    leading: (
      <Avatar
        size={40}
        shape="square"
        initials={getInitials("Tom Hélière")}
        imageUrl="https://avatars.githubusercontent.com/u/135361669?v=4"
      />
    ),
    onPress: () => Linking.openURL("https://www.linkedin.com/in/tom-heliere/"),
  },
  {
    title: "Rémy Godet",
    description: "Développeur",
    login: "godetremy",
    leading: (
      <Avatar
        size={40}
        shape="square"
        initials={getInitials("Rémy Godet")}
        imageUrl="https://avatars.githubusercontent.com/u/77058107?v=4"
      />
    ),
    onPress: () => Linking.openURL("https://www.linkedin.com/in/godetremy/"),
  },
  {
    title: "Mael Duret",
    description: "Développeur",
    login: "ryzenixx",
    leading: (
      <Avatar
        size={40}
        shape="square"
        initials={getInitials("Mael Duret")}
        imageUrl="https://avatars.githubusercontent.com/u/96339570?v=4"
      />
    ),
    onPress: () => Linking.openURL("https://www.linkedin.com/in/mael-duret/"),
  },
];

export default function SettingsAbout() {
  const theme = useTheme();
  const router = useRouter();

  const { t } = useTranslation();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const CommunityLinks = [
    {
      title: t("Settings_Donator"),
      description: t("Settings_Donator_Description"),
      leading: <Papicons name="PiggyBank" />,
      onPress: () =>
        Linking.openURL("https://ko-fi.com/thepapillonapp/leaderboard"),
    },
    {
      title: t("Settings_About_Discord"),
      description: t("Settings_About_Discord_Description"),
      leading: <Papicons name="TextBubble" />,
      onPress: () => Linking.openURL("https://go.papillon.bzh/discord"),
    },
    {
      title: t("Settings_About_Issue"),
      description: t("Settings_About_Issue_Description"),
      leading: <Papicons name="Info" />,
      onPress: () =>
        Linking.openURL("https://github.com/PapillonApp/Papillon/issues"),
    },
  ];

  const DeveloperLinks = [
    {
      title: t("Settings_About_Crowdin"),
      description: t("Settings_About_Crowdin_Description"),
      leading: <Languages />,
      onPress: () => Linking.openURL("https://crowdin.com/project/papillonapp"),
    },
    {
      title: t("Settings_About_Github"),
      description: t("Settings_About_Github_Description"),
      leading: <Github />,
      onPress: () => Linking.openURL("https://github.com/PapillonApp/Papillon"),
    },
    {
      title: t("Settings_About_Contributors"),
      description: t("Settings_About_Contributors_Description"),
      leading: <Users />,
      onPress: () => router.push("/(settings)/contributors"),
    },
  ];

  const [tapCount, setTapCount] = useState(0);

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
    },
  ];

  const insets = useSafeAreaInsets();

  return (
    <List
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
      contentInsetAdjustmentBehavior="always"
      showsVerticalScrollIndicator={false}
    >
      <List.View style={{ marginBottom: 10 }}>
        <SettingsHeader
          color={theme.dark ? "#121e2a" : "#dfebf7"}
          title={t("Settings_About_Papillion_Behind")}
          description={t("Settings_About_Papillion_Behind_Description")}
          imageSource={require("@/assets/images/about_papillon.png")}
          disableMargin
          height={270}
        />
      </List.View>

      <List.Section>
        {Team.map((item, index) => (
          <List.Item key={index} onPress={item.onPress}>
            <List.Leading>
              <Icon>{item.leading}</Icon>
            </List.Leading>

            <Typography variant="title">{item.title}</Typography>

            <Typography variant="caption" color="textSecondary">
              {item.description}
            </Typography>

            <List.Trailing>
              <Icon>
                <Papicons name="ChevronRight" />
              </Icon>
            </List.Trailing>
          </List.Item>
        ))}
      </List.Section>

      <List.Section>
        {CommunityLinks.map((item, index) => (
          <List.Item key={index} onPress={item.onPress}>
            <List.Leading>
              <Icon>{item.leading}</Icon>
            </List.Leading>

            <Typography variant="title">{item.title}</Typography>

            <Typography variant="caption" color="textSecondary">
              {item.description}
            </Typography>

            <List.Trailing>
              <Icon>
                <Papicons name="ChevronRight" />
              </Icon>
            </List.Trailing>
          </List.Item>
        ))}
      </List.Section>

      <List.Section>
        {DeveloperLinks.map((item, index) => (
          <List.Item key={index} onPress={item.onPress}>
            <List.Leading>
              <Icon>{item.leading}</Icon>
            </List.Leading>

            <Typography variant="title">{item.title}</Typography>

            <Typography variant="caption" color="textSecondary">
              {item.description}
            </Typography>

            <List.Trailing>
              <Icon>
                <Papicons name="ChevronRight" />
              </Icon>
            </List.Trailing>
          </List.Item>
        ))}
      </List.Section>

      <List.Section>
        {Infos.map((item, index) => (
          <List.Item key={index} onPress={item.onPress}>
            <List.Leading>
              <Icon>{item.leading}</Icon>
            </List.Leading>

            <Typography variant="title">{item.title}</Typography>

            <Typography variant="caption" color="textSecondary">
              {item.description}
            </Typography>
          </List.Item>
        ))}
      </List.Section>
    </List>
  );
}
