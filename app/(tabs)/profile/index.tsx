import React, { useCallback, useState } from "react";
import { View, Dimensions, Image, Pressable } from "react-native";
import {
  LinearTransition,
} from "react-native-reanimated";

import { Animation } from "@/ui/utils/Animation";
import Typography from "@/ui/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { AlignCenter, ArrowUpRight, BackpackIcon, BookIcon, BookOpenIcon, BookOpenTextIcon, CreditCardIcon, Ellipsis, MessageCircleIcon, SchoolIcon, SofaIcon, StarIcon } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import TabFlatList from "@/ui/components/TabFlatList";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";
import Icon from "@/ui/components/Icon";
import adjust from "@/utils/adjustColor";

function Tabs() {
  const enabledTabs = [
    {
      icon: SofaIcon,
      title: "Assiduité",
      unread: 1,
      denominator: "absence(s)",
      color: "#C50066",
    },
    {
      icon: MessageCircleIcon,
      title: "Discussions",
      unread: 2,
      denominator: "non lu(e)s",
      color: "#0094C5",
    }
  ];

  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack direction="horizontal" hAlign="center" vAlign="center" gap={10}>
      {enabledTabs.map((tab, index) => (
        <Pressable style={{ flex: 1 }} key={index}>
          <Stack
            flex
            card
            direction="horizontal"
            hAlign="center"
            gap={14}
            padding={16}
            height={58}
            radius={200}
            backgroundColor={tab.unread > 0 ? adjust(tab.color, theme.dark ? -0.85 : 0.85) : colors.card}
          >
            <tab.icon size={24} color={tab.unread > 0 ? tab.color : colors.text} />
            <Stack direction="vertical" hAlign="start" gap={2} style={{ marginBottom: -2 }}>
              <Typography inline variant="title" color={tab.unread > 0 ? tab.color : colors.text}>{tab.title}</Typography>
              <Typography inline variant="caption" color={tab.unread > 0 ? tab.color : "secondary"}>{tab.unread > 0 ? `${tab.unread} ${tab.denominator}` : "Ouvrir"}</Typography>
            </Stack>
          </Stack>
        </Pressable>
      ))}
    </Stack >
  );
}

function News() {
  const theme = useTheme();
  const { colors } = theme;

  // Example news item
  const newsItems = [
    {
      title: "Chasse aux œufs dans la cour organisé par la MDL",
      date: "16/01",
      author: "M. SAMSOM",
    },
    {
      title: "Réunion parents-professeurs",
      date: "20/01",
      author: "M. DUPONT",
    }
  ];

  return (
    <>
      <Stack
        direction="horizontal"
        gap={12}
        card
        vAlign="start"
        hAlign="center"
        style={{
          paddingHorizontal: 10,
          paddingTop: 8,
          paddingBottom: 8 + 38,
          marginBottom: -38,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        backgroundColor={adjust("#7DBB00", theme.dark ? -0.85 : 0.85)}
      >
        <BookOpenTextIcon
          color={adjust("#7DBB00", theme.dark ? 0.3 : -0.3)}
          size={22}
          strokeWidth={2.2}
          style={{ marginLeft: 8 }}
        />
        <Typography
          color={adjust("#7DBB00", theme.dark ? 0.3 : -0.3)}
          style={{ flex: 1 }}
          variant="h5"
        >
          Actualités
        </Typography>
        <Pressable>
          <Stack direction="horizontal" vAlign="center" hAlign="center" card inline padding={[12, 6]} radius={100} height={32}>
            <Typography style={{ marginBottom: -3 }} inline color="secondary">
              {newsItems.length} nouvelles
            </Typography>
            <Icon style={{ opacity: 0.5 }}>
              <ArrowUpRight size={20} />
            </Icon>
          </Stack>
        </Pressable>
      </Stack>
      <List marginBottom={0} radius={24}>
        {newsItems.map((item, index) => (
          <Item key={index}>
            <Typography variant="title" color="text">
              {item.title}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.date}  ·  {item.author}
            </Typography>
          </Item>
        ))}
      </List>
    </>
  )
}

function Cards() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Pressable>
      <Stack card height={84} direction="horizontal" vAlign="start" hAlign="center" gap={12} padding={18} radius={24} backgroundColor={"#F0F0F0"}>
        <CreditCardIcon style={{ opacity: 0.8 }} size={22} strokeWidth={2.2} />
        <Typography variant="h5" color="text" style={{ opacity: 0.6 }}>
          Mes cartes
        </Typography>

        <View
          style={{
            width: 200,
            height: 84,
            position: "absolute",
            right: 0,
            overflow: "hidden",
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <Image
            source={require('@/assets/images/cartes.png')}
            style={{
              width: 140,
              height: 120,
              position: "absolute",
              right: -32,
              bottom: -32,
            }}
          />
        </View>
      </Stack>
    </Pressable>
  );
}

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const windowHeight = Dimensions.get('window').height;
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const theme = useTheme();
  const { colors } = useTheme();

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);


  return (
    <>

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Pressed");
          }}
        >
          <AlignCenter color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>
      <NativeHeaderTitle ignoreTouch key={`header-title:` + fullyScrolled}>
        <NativeHeaderTopPressable layout={Animation(LinearTransition)}>
          <Dynamic
            animated={true}
            style={{
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              marginTop: fullyScrolled ? 6 : 0
            }}
          >
            <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: 4, width: 200, justifyContent: "center" }}>
              <Dynamic animated>
                <Typography inline variant="navigation">Mon profil</Typography>
              </Dynamic>
            </Dynamic>
            {fullyScrolled && (
              <Dynamic animated>
                <Typography inline variant="body2" color="secondary">
                  Lucas Lavajo
                </Typography>
              </Dynamic>
            )}
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Pressed");
          }}
        >
          <Ellipsis color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <TabFlatList
        backgroundColor={theme.dark ? "#000000" : "#F0F0F0"}
        height={200}
        onFullyScrolled={handleFullyScrolled}
        data={["tabs", "news", "cards", "apps"]}
        gap={16}
        radius={42}
        renderItem={({ item, index }) => (
          item === "tabs" ?
            <Tabs /> : item === "news" ?
              <News /> : item === "cards" ?
                <Cards /> : null
        )}
        keyExtractor={(item) => item + "a"}
        header={
          <>
            <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 20 }}>
              <Stack direction={"vertical"} hAlign={"center"} gap={10} style={{ flex: 1 }}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={{ width: 75, height: 75, borderRadius: 500 }}
                />
                <Typography variant={"h3"} color="text">
                  Lucas Lavajo
                </Typography>
                <Stack direction={"horizontal"} hAlign={"center"} vAlign={"center"} gap={6}>
                  <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Icon>
                      <BackpackIcon size={20} opacity={0.7} />
                    </Icon>
                    <Typography variant={"body1"} color="secondary">
                      T6
                    </Typography>
                  </Stack>
                  <Stack direction={"horizontal"} gap={8} hAlign={"center"} radius={100} backgroundColor={colors.background} inline style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Icon>
                      <SchoolIcon size={20} opacity={0.7} />
                    </Icon>
                    <Typography variant={"body1"} color="secondary">
                      Lycée Frédéric Bazille
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </>
        }
      />
    </>
  );
}