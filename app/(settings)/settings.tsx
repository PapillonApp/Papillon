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

const SettingsIndex = () => {
  const router = useRouter();

  const SettingsList = [
    {
      title: "Général",
      content: [
        {
          title: "Lucas Lavajo",
          description: "Mon compte",
          avatar: require('@/assets/images/default_profile.jpg'),
          color: "#888888",
        },
        {
          title: "Services liés",
          icon: <SquaresExcludeIcon />,
          color: "#888888",
        },
      ],
    },
    {
      title: "Général",
      content: [
        {
          title: "Notifications",
          description: "Alertes, fréquence...",
          icon: <BellDotIcon />,
          color: "#A80000",
        },
        {
          title: "Matières",
          description: "Nom, couleur, police...",
          icon: <BookIcon />,
          color: "#A84E00",
        },
        {
          title: "Personnalisation",
          description: "Thèmes, couleurs...",
          icon: <PaletteIcon />,
          color: "#7EA800",
        },
        {
          title: "Cartes",
          description: "Cantine, accès...",
          icon: <CreditCardIcon />,
          color: "#0092A8",
        },
        {
          title: "Accessibilité",
          description: "Affichage, son...",
          icon: <AccessibilityIcon />,
          color: "#0038A8",
        },
        {
          title: "Magic+",
          description: "Fonctionnalités intelligentes",
          icon: <SparklesIcon />,
          color: "#5D00A8",
        },
        {
          title: "Faire un don",
          description: "Soutenir le projet",
          icon: <HeartIcon />,
          color: "#EFA400",
        },
        {
          title: "À propos",
          description: "version 8.0.0",
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