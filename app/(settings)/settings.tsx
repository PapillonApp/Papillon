import { HeaderBackButton } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { t } from "i18next";
import { AccessibilityIcon, HeartIcon, InfoIcon } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import { Alert, Image, Platform, View } from "react-native";

import { Papicons } from '@getpapillon/papicons';

import { NativeHeaderSide } from "@/ui/components/NativeHeader";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import TableFlatList from "@/ui/components/TableFlatList";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import List from "@/ui/components/List";
import Item, { Leading } from "@/ui/components/Item";
import { useAccountStore } from "@/stores/account";
import { error } from "@/utils/logger/logger";
import { ClearDatabaseForAccount } from "@/database/DatabaseProvider";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import * as WebBrowser from "expo-web-browser";
import packagejson from "../../package.json"
import Avatar from "@/ui/components/Avatar";
import { getInitials } from "@/utils/chats/initials";
import { useSettingsStore } from "@/stores/settings";

export default function SettingsIndex() {
  const router = useRouter();
  const navigation = useNavigation();

  const theme = useTheme();
  const { colors } = theme;

  const accountStore = useAccountStore();
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const settingsStore = useSettingsStore(state => state.personalization);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, lastName, level, establishment] = useMemo(() => {
    if (!account) return [null, null, null, null];

    let firstName = account.firstName;
    let lastName = account.lastName;
    let level = account.className;
    let establishment = account.schoolName;

    return [firstName, lastName, level, establishment];
  }, [account]);

  const logout = useCallback(() => {
    const account = accountStore.accounts.find(account => account.id === accountStore.lastUsedAccount)
    if (account) {
      useAccountStore.getState().removeAccount(account)
      useAccountStore.getState().setLastUsedAccount("")
      for (const service of account.services) {
        ClearDatabaseForAccount(service.id)
      }
    } else {
      error("Unable to find the current account")
    }
    router.replace("/(onboarding)/welcome");

  }, [account, accountStore, router]);

  const MoreSettingsList = [
    {
      title: t('Settings_More'),
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
          title: t('Settings_Donate_Title'),
          description: t('Settings_Donate_Description'),
          papicon: <Papicons name={"Heart"} />,
          icon: <HeartIcon />,
          color: "#EFA400",
          onPress: () => WebBrowser.openBrowserAsync("https://go.papillon.bzh/donate")
        },
        {
          title: t('Settings_About_Title'),
          description: `${t('Settings_About_Description')} ${packagejson.version}`,
          icon: <InfoIcon />,
          papicon: <Papicons name={"Info"} />,
          color: "#797979",
          onPress: () => router.navigate("/(settings)/about")
        }
      ]
    },
    {
      title: t('Settings_About'),
      content: [
        {
          title: t('Settings_Telemetry_Title'),
          description: t('Settings_Telemetry_Description'),
          icon: <InfoIcon />,
          papicon: <Papicons name={"Check"} />,
          color: "#797979",
          onPress: () => router.navigate("../consent")
        },
        {
          title: t('Settings_Logout_Title'),
          description: t('Settings_Logout_Description'),
          papicon: <Papicons name={"Logout"} />,
          color: "#a80000",
          onPress: () => {
            Alert.alert(
              t('Settings_Logout_Title'),
              t('Settings_Logout_Description'),
              [
                {
                  text: t('CANCEL_BTN'),
                  style: 'cancel',
                },
                {
                  text: t('Settings_Logout_Title'),
                  style: 'destructive',
                  onPress: () => {
                    logout();
                  },
                },
              ],
              { cancelable: true }
            );
          }
        },
      ]
    },
    ...(settingsStore.showDevMode ? [{
      title: t('Settings_Dev'),
      content: [
        ...(settingsStore.showDevMode ? [{
          title: "Mode développeur",
          description: "Options avancées pour les développeurs.",
          papicon: <Papicons name={"Code"} />,
          icon: <InfoIcon />,
          color: "#FF6B35",
          onPress: () => router.navigate("/devmode")
        }] : []),
      ]
    }] : []),
  ]

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
        icon: <Papicons name={"Card"} />,
        title: t("Settings_Cards_Banner_Title"),
        description: t('Settings_Cantineen_Subtitle_Card'),
        color: "#0059DD",
        onPress: () => {
          router.navigate("/(settings)/cards")
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
                <AnimatedPressable
                  onPress={button.onPress}
                  style={{ flex: 1, width: "50%", opacity: 0.3 }}
                  key={button.title}
                >
                  <Stack
                    flex
                    card
                    direction="vertical"
                    gap={8}
                    padding={[14, 14]}
                    radius={22}
                    backgroundColor={button.disabled ? theme.colors.border : adjust(button.color, theme.dark ? -0.85 : 0.85)}
                  >
                    <Icon papicon size={32} fill={button.disabled ? "#505050" : newButtonColor}>
                      {button.icon}
                    </Icon>
                    <Stack direction="vertical" hAlign="start" gap={0}>
                      <Typography inline variant="title" weight="bold" color={button.disabled ? "#505050" : newButtonColor}>{button.title}</Typography>
                      <Typography inline variant="body2" weight="medium" color={button.disabled ? "#505050" : newButtonColor}>{button.description}</Typography>
                    </Stack>
                  </Stack>
                </AnimatedPressable>
              )
            })}
          </Stack>
        ))}
      </Stack>
    );
  }, [theme.dark]);

  return (
    <>
      <TableFlatList
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={(
          <View
            style={{ marginBottom: 16, gap: 4 }}
          >
            <List>
              <Item
                onPress={() => router.navigate("/(settings)/services")}
              >
                <Leading>
                  <Avatar
                    size={48}
                    initials={getInitials(`${account?.firstName} ${account?.lastName}`)}
                    imageUrl={account && account.customisation && account.customisation.profilePicture ? `data:image/png;base64,${account.customisation.profilePicture}` : undefined}
                  />
                </Leading>
                <Typography variant="title">
                  {firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : t('Settings_NoAccount')}
                </Typography>
                {establishment &&
                  <Typography variant="caption" color="secondary">
                    {level} {(level && establishment) && " — "} {establishment}
                  </Typography>
                }
              </Item>
            </List>
            <RenderBigButtons
            />
          </View>
        )}
        sections={MoreSettingsList.map(section => ({
          title: section.title,
          hideTitle: true,
          items: section.content.map(item => ({
            title: item.title,
            description: item.description,
            icon: ('icon' in item ? item.icon : undefined) as React.ReactNode,
            leading: 'avatar' in item && item.avatar ? (
              <Image
                source={item.avatar}
                style={{ width: 48, height: 48, borderRadius: 500, marginRight: -4 }}
              />
            ) : null,
            papicon: ('papicon' in item ? item.papicon : undefined) as React.ReactNode,
            onPress: 'onPress' in item ? item.onPress as (() => void) | undefined : undefined,
            tags: 'tags' in item ? item.tags as string[] | undefined : undefined,
          })),
        }))}
      />
      {
        Platform.OS === 'ios' && (
          <NativeHeaderSide side="Left">
            <HeaderBackButton
              tintColor={runsIOS26 ? colors.text : colors.primary}
              onPress={() => router.back()}

              style={{
                marginLeft: runsIOS26 ? 3 : -32,
              }}
            />
          </NativeHeaderSide>
        )
      }
    </>
  );
};