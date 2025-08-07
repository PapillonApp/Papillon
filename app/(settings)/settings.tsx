import { HeaderBackButton } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { AccessibilityIcon, BellDotIcon, BookIcon, ChevronRight, CreditCardIcon, HeartIcon, InfoIcon, PaletteIcon, SparklesIcon, SquaresExcludeIcon } from "lucide-react-native";
import React from "react";
import { Image, Platform, ScrollView } from "react-native";

import * as Papicons from '@getpapillon/papicons';

import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import { NativeHeaderSide } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { it } from "date-fns/locale";

const SettingsIndex = () => {
  const router = useRouter();
  const theme = useTheme();
  const { colors } = theme;

  const SettingsList = [
    {
      title: t('Settings_Profile'),
      content: [
        {
          title: t('Settings_Account_Title'),
          description: t('Settings_Account_Description'),
          avatar: require('@/assets/images/default_profile.jpg'),
          color: "#888888",
        },
        {
          title: t('Settings_Services_Title'),
          icon: <SquaresExcludeIcon />,
          papicon: <Papicons.User />,
          color: "#888888",
          onPress: () => router.push('/(settings)/services'),
        },
      ],
    },
    {
      title: t('Settings_General'),
      content: [
        {
          title: t('Settings_Notifications_Title'),
          description: t('Settings_Notifications_Description'),
          papicon: <Papicons.Bell />,
          icon: <BellDotIcon />,
          color: "#A80000",
        },
        {
          title: t('Settings_Subjects_Title'),
          description: t('Settings_Subjects_Description'),
          papicon: <Papicons.Calendar />,
          icon: <BookIcon />,
          color: "#A84E00",
        },
        {
          title: t('Settings_Personalization_Title'),
          description: t('Settings_Personalization_Description'),
          papicon: <Papicons.Palette />,
          icon: <PaletteIcon />,
          color: "#7EA800",
        },
        {
          title: t('Settings_Cards_Title'),
          description: t('Settings_Cards_Description'),
          papicon: <Papicons.Card />,
          icon: <CreditCardIcon />,
          color: "#0092A8",
        },
      ],
    },
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
      ],
    },
    {
      title: t('Settings_AI'),
      content: [
        {
          title: t('Settings_MagicPlus_Title'),
          description: t('Settings_MagicPlus_Description'),
          papicon: <Papicons.Sparkles />,
          icon: <SparklesIcon />,
          color: "#5D00A8",
        },
      ],
    },
    {
      title: t('Settings_More'),
      content: [
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
    },
  ];

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 6 }}
      >
        {SettingsList.map((category, cIndex) => (
          <List key={cIndex}>
            {category.content.map((item, index) => (
              <Item key={index} onPress={() => { item.onPress && item.onPress() }}>
                {item.avatar && (
                  <Leading>
                    <Image
                      source={item.avatar}
                      style={{ width: 48, height: 48, borderRadius: 500, marginRight: -4 }}
                    />
                  </Leading>
                )}
                {item.papicon ? (
                  <Icon papicon opacity={0.5}>
                    {item.papicon}
                  </Icon>
                ) : item.icon && (
                  <Icon opacity={0.5}>
                    {item.icon}
                  </Icon>
                )}
                {item.title &&
                  <Typography variant="title">
                    {item.title}
                  </Typography>
                }
                {item.description &&
                  <Typography variant="caption" color="secondary">
                    {item.description}
                  </Typography>
                }
                <Trailing>
                  <Icon>
                    <ChevronRight
                      size={24}
                      strokeWidth={2}
                      style={{ marginRight: -8, opacity: 0.7 }}
                    />
                  </Icon>
                </Trailing>
              </Item>
            ))}
          </List>
        ))}
      </ScrollView>

      {Platform.OS === 'ios' && (
        <NativeHeaderSide side="Left">
          <HeaderBackButton
            tintColor={(runsIOS26() || Platform.OS === 'android') ? colors.text : colors.primary}
            onPress={() => router.back()}

            style={{
              marginLeft: (runsIOS26() || Platform.OS === 'android') ? 3 : -32,
            }}
          />
        </NativeHeaderSide>
      )}
    </>
  );
};

export default SettingsIndex;