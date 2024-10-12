import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  LogBox
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
import { Chat } from "@/services/shared/Chat";
import { getChats } from "@/services/chats";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";

// Voir la documentation de `react-navigation`.
//
// Nous sommes dans un cas particulier où l'on a le droit
// de faire transmettre des objets non-sérialisables dans
// le state de navigation.
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const Messages: Screen<"Messages"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(state => state.account!);
  const [chats, setChats] = useState<Chat[] | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  useEffect(() => {
    void async function () {
      const chats = await getChats(account);
      setChats(chats);
    }();
  }, [account?.instance]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("ChatCreate")}
      >
        <NativeText>
          Nouvelle discussion
        </NativeText>
      </TouchableOpacity>
      <NativeList>
        {!chats ? (
          <NativeItem>
            <NativeText>
              En cours de chargement
            </NativeText>
          </NativeItem>
        ) : chats.length === 0 ? (
          <NativeItem>
            <NativeText>
              Aucune discussion !
            </NativeText>
          </NativeItem>
        ) : chats.map((chat) => (
          <NativeItem
            key={chat.id}
            onPress={() => navigation.navigate("Chat", { handle: chat })}
            leading={<InitialIndicator
              initial={parse_initials(chat.recipient)}
              color={theme.colors.primary}
            />}


          >
            <NativeText>
              {chat.recipient}
            </NativeText>
            <NativeText>
              {chat.subject}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};


export default Messages;
