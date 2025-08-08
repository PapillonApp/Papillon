import { HeaderBackButton } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { AccessibilityIcon, HeartIcon, InfoIcon } from "lucide-react-native";
import React, { useCallback } from "react";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import { Image, Platform, Pressable, View } from "react-native";

import * as Papicons from '@getpapillon/papicons';

import { NativeHeaderSide } from "@/ui/components/NativeHeader";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import TableFlatList from "@/ui/components/TableFlatList";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";

const SettingsIndex = () => {
  const router = useRouter();
  const theme = useTheme();
  const { colors } = theme;

  const AccountSettingsList = [
    {
      title: t('Settings_Profile'),
      content: [
        {
          title: t('Settings_Account_Title'),
          description: t('Settings_Account_Description'),
          avatar: require('@/assets/images/default_profile.jpg'),
          color: "#888888",
          tags: ["T6", "Université Paris 8"]
        }
      ],
    }
  ];
  const MoreSettingsList = [
    {
      title: t('Settings_More'),
      content: [
        {
          title: t('Settings_Accessibility_Title'),
          description: t('Settings_Accessibility_Description'),
          papicon: <Papicons.Accessibility />,
          icon: <AccessibilityIcon />,
          color: "#0038A8",
        },
        {
          title: t('Settings_Donate_Title'),
          description: t('Settings_Donate_Description'),
          papicon: <Papicons.Heart />,
          icon: <HeartIcon />,
          color: "#EFA400",
        },
        {
          title: t('Settings_About_Title'),
          description: t('Settings_About_Description'),
          icon: <InfoIcon />,
          papicon: <Papicons.Info />,
          color: "#797979",
        }
      ]
    }
  ]

  const BigButtons: Array<{ icon: React.ReactNode, title: string, description: string, color: string }> = [
    {
      icon: <Papicons.Palette />,
      title: "Personnalisation",
      description: "Thèmes, matières...",
      color: "#17C300"
    },
    {
      icon: <Papicons.Bell />,
      title: "Notifications",
      description: "Alertes, fréquence...",
      color: "#DD9B00"
    },
    {
      icon: <Papicons.Card />,
      title: "Cartes",
      description: "Cantine, accès",
      color: "#0059DD"
    },
    {
      icon: <Papicons.Sparkles />,
      title: "Magic+",
      description: "Fonctions I.A",
      color: "#DD007D"
    }
  ]

  const RenderBigButtons = useCallback(() => {
    return (
      <Stack direction="vertical" gap={15}>
        {Array.from({ length: Math.ceil(BigButtons.length / 2) }, (_, rowIndex) => (
          <Stack key={rowIndex} direction="horizontal" gap={15}>
            {BigButtons.slice(rowIndex * 2, rowIndex * 2 + 2).map((button, buttonIndex) => (
              <Pressable style={{ flex: 1, width: "50%" }} key={button.title}>
                <Stack
                  flex
                  card
                  direction="vertical"
                  gap={14}
                  padding={16}
                  radius={25}
                  backgroundColor={adjust(button.color, theme.dark ? -0.85 : 0.85)}
                >
                  <Icon papicon size={24} fill={button.color}>
                    {button.icon}
                  </Icon>
                  <Stack direction="vertical" hAlign="start" gap={2} style={{ marginBottom: -2 }}>
                    <Typography inline variant="title" color={button.color}>{button.title}</Typography>
                    <Typography inline variant="caption" color={button.color}>{button.description}</Typography>
                  </Stack>
                </Stack>
              </Pressable>
            ))}
          </Stack>
        ))}
      </Stack>
    );
  }, [])

  return (
    <>
      <View style={{ flex: 1, height: "auto", justifyContent: "flex-start" }}>
        <TableFlatList
          sections={AccountSettingsList.map(section => ({
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
              tags: 'tags' in item ? item.tags as string[] | undefined : undefined
            })),
          }))}
        />
        <TableFlatList
          sections={[]}
          ListHeaderComponent={RenderBigButtons}
        />
        <TableFlatList
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
              tags: 'tags' in item ? item.tags as string[] | undefined : undefined
            })),
          }))}
        />
      </View>
      {Platform.OS === 'ios' && (
        <NativeHeaderSide side="Left">
          <HeaderBackButton
            tintColor={runsIOS26() ? colors.text : colors.primary}
            onPress={() => router.back()}

            style={{
              marginLeft: runsIOS26() ? 3 : -32,
            }}
          />
        </NativeHeaderSide>
      )}
    </>
  );
};

export default SettingsIndex;