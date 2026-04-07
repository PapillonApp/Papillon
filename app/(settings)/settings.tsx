import { Papicons } from '@getpapillon/papicons';
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { t } from "i18next";
import { BusIcon, HeartIcon, InfoIcon } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { Alert, Image, Platform, Pressable, View } from "react-native";

import { ClearDatabaseForAccount } from "@/database/DatabaseProvider";
import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Avatar from "@/ui/components/Avatar";
import Icon from "@/ui/components/Icon";
import { NativeHeaderSide } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import TableFlatList from "@/ui/components/TableFlatList";
import TypographyLegacy from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import { getInitials } from "@/utils/chats/initials";
import { formatSchoolName } from '@/utils/format/formatSchoolName';
import { error } from "@/utils/logger/logger";
import {
  ANONYMOUS_PROFILE_BLUR_RADIUS,
  getDisplayInitials,
  getDisplayPersonName,
  getDisplaySchoolName,
  useAnonymousMode,
} from "@/utils/privacy/anonymize";
import { getAccountProfilePictureUri } from "@/utils/profilePicture";

import packagejson from "../../package.json"
import List, { ListTouchable } from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

export default function SettingsIndex() {
  const router = useRouter();
  const navigation = useNavigation();

  const theme = useTheme();
  const { colors } = theme;

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const clearAccounts = useAccountStore((state) => state.clearAccounts);

  const settingsStore = useSettingsStore(state => state.personalization);
  const anonymousMode = useAnonymousMode();
  const currentVersion = packagejson.version;
  const releaseNotesUrl = `https://papillon.bzh/release-notes/${currentVersion}`;

  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, lastName, level, establishment] = useMemo(() => {
    if (!account) { return [null, null, null, null]; }

    const displayName = getDisplayPersonName(account.firstName, account.lastName, anonymousMode);
    const [displayFirstName, ...displayLastNameParts] = displayName.split(" ");
    const level = account.className;
    const establishment = getDisplaySchoolName(account.schoolName, anonymousMode);

    return [displayFirstName ?? null, displayLastNameParts.join(" ") || null, level, establishment];
  }, [account, anonymousMode]);

  const logout = useCallback(() => {
    clearAccounts();
    router.replace("/(onboarding)/welcome");

  }, [clearAccounts, router]);

  const MoreSettingsList = [
    {
      title: t("Settings_Preferences"),
      content: [
        /*{
          title: t('Settings_Accessibility_Title'),
          description: t('Settings_Accessibility_Description'),
          papicon: <Papicons name={"Accessibility"} />,
          icon: <AccessibilityIcon />,
          color: "#0038A8",
          onPress: () => Alert.alert("Ça arrive... ✨", "Cette fonctionnalité n'est pas encore disponible.")
        },*/
        {
          title: t("Settings_Transport_Title"),
          description: t("Settings_Transport_Description"),
          papicon: <Papicons name={"Bus"} />,
          icon: <BusIcon />,
          color: "#000",
          onPress: () => router.navigate("/(settings)/transport"),
        },
      ],
    },
    {
      title: t("Settings_More"),
      content: [
        /*{
          title: t('Settings_Accessibility_Title'),
          description: t('Settings_Accessibility_Description'),
          papicon: <Papicons name={"Accessibility"} />,
          icon: <AccessibilityIcon />,
          color: "#0038A8",
          onPress: () => Alert.alert("Ça arrive... ✨", "Cette fonctionnalité n'est pas encore disponible.")
        },*/
        {
          title: t("Settings_ReleaseNotes_Title"),
          description: t("Settings_ReleaseNotes_Description"),
          papicon: <Papicons name={"PrivatePapillonApp"} />,
          icon: <InfoIcon />,
          color: "#1F7AFC",
          onPress: () =>
            WebBrowser.openBrowserAsync(releaseNotesUrl, {
              presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            }),
        },
        {
          title: t("Settings_Donate_Title"),
          description: t("Settings_Donate_Description"),
          papicon: <Papicons name={"Heart"} />,
          icon: <HeartIcon />,
          color: "#EFA400",
          onPress: () =>
            WebBrowser.openBrowserAsync("https://go.papillon.bzh/donate"),
        },
        {
          title: t("Settings_About_Title"),
          description: `${t("Settings_About_Description")} ${currentVersion}`,
          icon: <InfoIcon />,
          papicon: <Papicons name={"Info"} />,
          color: "#797979",
          onPress: () => router.navigate("/(settings)/about"),
        },
      ],
    },
    {
      title: t("Settings_About"),
      content: [
        {
          title: t("Settings_Telemetry_Title"),
          description: t("Settings_Telemetry_Description"),
          icon: <InfoIcon />,
          papicon: <Papicons name={"Check"} />,
          color: "#797979",
          onPress: () => router.navigate("/consent"),
        },
        {
          title: t("Settings_Logout_Title"),
          description: t("Settings_Logout_Description"),
          papicon: <Papicons name={"Logout"} />,
          color: "#a80000",
          onPress: () => {
            Alert.alert(
              t("Settings_Logout_Title"),
              t("Settings_Logout_Description"),
              [
                {
                  text: t("CANCEL_BTN"),
                  style: "cancel",
                },
                {
                  text: t("Settings_Logout_Title"),
                  style: "destructive",
                  onPress: () => {
                    logout();
                  },
                },
              ],
              { cancelable: true }
            );
          },
        },
      ],
    },
    ...(settingsStore.showDevMode
      ? [
        {
          title: t("Settings_Dev"),
          content: [
            ...(settingsStore.showDevMode
              ? [
                {
                  title: "Mode développeur",
                  description: "Options avancées pour les développeurs.",
                  papicon: <Papicons name={"Code"} />,
                  icon: <InfoIcon />,
                  color: "#FF6B35",
                  onPress: () => router.navigate("/devmode"),
                },
              ]
              : []),
          ],
        },
      ]
      : []),
  ];

  const BigButtons: Array<{
    disabled?: boolean; icon: React.ReactNode, title: string, description: string, color: string, onPress?: () => void;
  }> = [
    {
      icon: <Papicons name={"Palette"} />,
      title: t('Settings_Personalization_Title_Card'),
      description: t('Settings_Personalization_Subtitle_Card'),
      color: "#17C300",
      onPress: () => {
        router.navigate("/(settings)/personalization")
      }
    },
    {
      icon: <Papicons name={"Calendar"} />,
      title: t('Settings_Personalization_Subject_Title_Card'),
      description: t('Settings_Personalization_Subject_Description'),
      color: "#8500dd",
      onPress: () => {
        router.navigate("/(settings)/subject_personalization")
      }
    },
    {
      icon: <Papicons name={"User"} />,
      title: t("Settings_Accounts_Title"),
      description: t('Settings_Accounts_Description'),
      color: "#0059DD",
      onPress: () => {
        router.navigate("/(settings)/accounts")
      }
    },
    {
      icon: <Papicons name={"Sparkles"} />,
      title: "Magic+",
      description: t('Settings_MagicPlus_Description_Card'),
      color: "#DD007D",
      onPress: () => {
        router.navigate("/(settings)/magic")
      }
    }
  ]

  const RenderBigButtons = useCallback(() => {
    return (
      <Stack direction="vertical" gap={10}>
        {Array.from({ length: Math.ceil(BigButtons.length / 2) }, (_, rowIndex) => (
          <Stack key={rowIndex} direction="horizontal" gap={10}>
            {BigButtons.slice(rowIndex * 2, rowIndex * 2 + 2).map((button, _) => {
              const newButtonColor = adjust(button.color, theme.dark ? 0.2 : -0.2);

              return (
                <View
                  style={{ flex: 1, borderRadius: 22, elevation: 2, overflow: "hidden" }}
                  key={button.title}
                >
                <ListTouchable
                  onPress={button.onPress}
                >
                  <Stack
                    flex
                    card
                    direction="vertical"
                    gap={8}
                    padding={[14, 14]}
                    radius={22}
                    style={[
                      Platform.OS === 'ios' ? { borderColor: adjust(button.color, theme.dark ? 0.3 : -0.3) + "45" } : { backgroundColor: adjust(button.color, theme.dark ? -0.8 : 0.8), borderWidth: 0 },
                    ]}
                  >
                    {Platform.OS === 'ios' && (
                      <LinearGradient
                        colors={[adjust(button.color, theme.dark ? 0.3 : 0.8), button.color]}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 22, opacity: 0.16 }}
                      />
                    )}
                    <Icon papicon size={32} fill={button.disabled ? "#505050" : newButtonColor}>
                      {button.icon}
                    </Icon>
                    <Stack direction="vertical" hAlign="start" gap={0}>
                      <TypographyLegacy inline variant="title" weight="bold" color={button.disabled ? "#505050" : newButtonColor}>{button.title}</TypographyLegacy>
                      <TypographyLegacy inline variant="body2" weight="medium" color={button.disabled ? "#505050" : newButtonColor}>{button.description}</TypographyLegacy>
                    </Stack>
                  </Stack>
                </ListTouchable>
                </View>
              )
            })}
          </Stack>
        ))}
      </Stack>
    );
  }, [theme.dark]);
  
  const insets = useSafeAreaInsets();

  const headerHeight = useHeaderHeight();
  const finalHeaderHeight = Platform.select({
    android: headerHeight -16,
    default: 0
  });

  return (
    <>
      <List
        contentInsetAdjustmentBehavior="automatic"
        gap={12}
        ListHeaderComponent={(
          <View
            style={{ marginVertical: 16, gap: 4 }}
          >
            <Stack
              flex
              direction="vertical"
              hAlign='center'
              vAlign='center'
              gap={6}
              padding={[16, 0]}
              style={{ paddingBottom: 24 }}
            >
              <Avatar
                size={72}
                initials={getDisplayInitials(getInitials(`${account?.firstName} ${account?.lastName}`), anonymousMode)}
                imageUrl={getAccountProfilePictureUri(account?.customisation?.profilePicture)}
                blurRadius={anonymousMode ? ANONYMOUS_PROFILE_BLUR_RADIUS : 0}
                style={{ marginBottom: 8 }}
              />
              <TypographyLegacy variant="h3" align="center">
                {firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : t('Settings_NoAccount')}
              </TypographyLegacy>
              {establishment &&
                <TypographyLegacy variant="body1" align="center" color="secondary">
                  {level} {(level && establishment) && " — "} {anonymousMode ? establishment : formatSchoolName(establishment)}
                </TypographyLegacy>
              }
            </Stack>
            <RenderBigButtons
            />
          </View>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, paddingTop: finalHeaderHeight + 16 }}
      >
        {MoreSettingsList.map(section => (
          <List.Section key={section.title}>
            {Platform.OS === 'android' && (
              <List.SectionTitle>
                <List.Label>{section.title}</List.Label>
              </List.SectionTitle>
            )}
            {section.content.map(item => (
              <List.Item key={item.title} onPress={item.onPress}>
                <List.Leading>
                  <Icon papicon size={24} fill={theme.colors.text}>
                    {item.papicon}
                  </Icon>
                </List.Leading>
                <Typography variant="title">{item.title}</Typography>
                <Typography variant="body1" color="textSecondary">
                  {item.description}
                </Typography>
              </List.Item>
            ))}
          </List.Section>
        ))}
      </List>
    </>
  );
};
