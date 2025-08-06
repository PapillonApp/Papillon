import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { useRouter } from "expo-router";
import { BellDotIcon, ChevronLeft, ChevronRight, CogIcon, BookIcon, PaletteIcon, CreditCardIcon, AccessibilityIcon, SparklesIcon, HeartIcon, InfoIcon, User2Icon, SquaresExcludeIcon } from "lucide-react-native";
import React from "react";
import { Image, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { t } from "i18next";

const SettingsIndex = () => {
  const router = useRouter();

  const SettingsList = [
    {
      title: t('Settings_General'),
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
          color: "#888888",
        },
      ],
    },
    {
      title: t('Settings_General'),
      content: [
        {
          title: t('Settings_Notifications_Title'),
          description: t('Settings_Notifications_Description'),
          icon: <BellDotIcon />,
          color: "#A80000",
        },
        {
          title: t('Settings_Subjects_Title'),
          description: t('Settings_Subjects_Description'),
          icon: <BookIcon />,
          color: "#A84E00",
        },
        {
          title: t('Settings_Personalization_Title'),
          description: t('Settings_Personalization_Description'),
          icon: <PaletteIcon />,
          color: "#7EA800",
        },
        {
          title: t('Settings_Cards_Title'),
          description: t('Settings_Cards_Description'),
          icon: <CreditCardIcon />,
          color: "#0092A8",
        },
        {
          title: t('Settings_Accessibility_Title'),
          description: t('Settings_Accessibility_Description'),
          icon: <AccessibilityIcon />,
          color: "#0038A8",
        },
        {
          title: t('Settings_MagicPlus_Title'),
          description: t('Settings_MagicPlus_Description'),
          icon: <SparklesIcon />,
          color: "#5D00A8",
        },
        {
          title: t('Settings_Donate_Title'),
          description: t('Settings_Donate_Description'),
          icon: <HeartIcon />,
          color: "#EFA400",
        },
        {
          title: t('Settings_About_Title'),
          description: t('Settings_About_Description'),
          icon: <InfoIcon />,
          color: "#797979",
        }
      ]
    },
  ];

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 6 }}
      >
        {SettingsList.map((category, cIndex) => (
          <List key={cIndex}>
            {category.content.map((item, index) => (
              <Item key={index} onPress={() => { }}>
                {item.avatar && (
                  <Leading>
                    <Image
                      source={item.avatar}
                      style={{ width: 48, height: 48, borderRadius: 500, marginRight: -4 }}
                    />
                  </Leading>
                )}
                {item.icon && (
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

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => router.back()}>
          <Icon>
            <ChevronLeft size={32} strokeWidth={1.8} style={{ marginLeft: -2 }} />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
};

export default SettingsIndex;