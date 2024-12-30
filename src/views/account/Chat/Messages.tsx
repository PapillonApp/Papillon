import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ScrollView,
  LogBox,
  View,
  ActivityIndicator,
  Platform,
  Text,
  RefreshControl,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import type { Chat } from "@/services/shared/Chat";
import { getChats } from "@/services/chats";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import { AccountService } from "@/stores/account/types";
import { getProfileColorByName } from "@/services/local/default-personalization";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import PapillonHeader from "@/components/Global/PapillonHeader";
import { SquarePen } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import InsetsBottomView from "@/components/Global/InsetsBottomView";

// Voir la documentation de `react-navigation`.
//
// Nous sommes dans un cas particulier où l'on a le droit
// de faire transmettre des objets non-sérialisables dans
// le state de navigation.
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const Discussions: Screen<"Discussions"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((state) => state.account!);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getChatCreator = (chat: Chat) => chat.creator === account.name ? chat.recipient : chat.creator;

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  useEffect(() => {
    void (async () => {
      const chats = await getChats(account);
      setChats(chats);
    })();
  }, [account?.instance]);

  const onRefresh = async () => {
    setRefreshing(true);
    const chats = await getChats(account);
    setChats(chats);
    setRefreshing(false);
  };

  if (account.service !== AccountService.Pronote)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 20,
        }}
      >
        <MissingItem
          emoji={"🚧"}
          title={"Fonctionnalité en construction"}
          description={
            "Cette page est en cours de développement, revenez plus tard."
          }
        />
      </View>
    );

  return (
    <>
      <PapillonHeader route={route} navigation={navigation}>
        <TouchableOpacity style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          paddingRight: 8,
        }}
        onPress={() => navigation.navigate("ChatCreate")}>
          <NativeText color={theme.colors.primary}>Composer</NativeText>
          <SquarePen color={theme.colors.primary}/>
        </TouchableOpacity>
      </PapillonHeader>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 0,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!chats ? (
          <Reanimated.View
            entering={FadeIn.springify().mass(1).damping(20).stiffness(300)}
            exiting={
              Platform.OS === "ios"
                ? FadeOut.springify().mass(1).damping(20).stiffness(300)
                : undefined
            }
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 26,
            }}
          >
            <ActivityIndicator size={"large"} />

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                textAlign: "center",
                fontFamily: "semibold",
                marginTop: 10,
              }}
            >
              Chargement des discussions...
            </Text>

            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                textAlign: "center",
                fontFamily: "medium",
                marginTop: 4,
                opacity: 0.5,
              }}
            >
              Vos conversations arrivent...
            </Text>
          </Reanimated.View>
        ) : chats.length === 0 ? (
          <MissingItem
            emoji="💬"
            title="Aucune discussion"
            description="Commencez une nouvelle discussion pour les afficher ici."
            entering={animPapillon(FadeInDown)}
            exiting={animPapillon(FadeOut)}
            style={{ paddingVertical: 26 }}
          />
        ) : (
          <NativeList>
            {chats.map((chat) => (
              <NativeItem
                key={chat.id}
                onPress={() => navigation.navigate("Chat", { handle: chat })}
                leading={
                  <InitialIndicator
                    initial={parse_initials(getChatCreator(chat))}
                    color={getProfileColorByName(getChatCreator(chat)).bright}
                    textColor={getProfileColorByName(getChatCreator(chat)).dark}
                  />
                }
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  {!chat.read && (
                    <View
                      style={{
                        backgroundColor: getProfileColorByName(getChatCreator(chat))
                          .dark,
                        borderRadius: 5,
                        height: 10,
                        width: 10,
                      }}
                    />
                  )}
                  <NativeText variant={"subtitle"}>{getChatCreator(chat)}</NativeText>
                </View>
                <NativeText>{chat.subject || "Aucun sujet"}</NativeText>
                <NativeText variant={"subtitle"}>Il y a {Math.floor((new Date().getTime() - new Date(chat.date).getTime()) / (1000 * 60 * 60 * 24))} jours</NativeText>
              </NativeItem>
            ))}
          </NativeList>
        )}

        <InsetsBottomView />
      </ScrollView>
    </>
  );
};

export default Discussions;
