import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import type { ChatMessage } from "@/services/shared/Chat";
import { getChatMessages } from "@/services/chats";
import RenderHTML from "react-native-render-html";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { HomeworkReturnType } from "@/services/shared/Homework";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Paperclip, FileText } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";

const Chat: Screen<"Chat"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(state => state.account!);
  const [messages, setMessages] = useState<ChatMessage | null>(null);

  useEffect(() => {
    void async function () {
      const messages = await getChatMessages(account, route.params.handle);
      setMessages(messages);
    }();
  }, [route.params.handle]);

  return (
    <View style={{flex: 1}}>
      {messages && <>
        <PapillonModernHeader outsideNav={true} startLocation={0.6} height={110}>
          <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
            <View style={{backgroundColor: theme.colors.background, borderRadius: 100}}>
              <View
                style={{
                  borderRadius: 100,
                  width: 42,
                  height: 42,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <InitialIndicator
                  initial={parse_initials(messages?.author)}
                  color={theme.colors.primary}
                />
              </View>
            </View>
            <View style={{flex: 1}}>
              <NativeText variant="title" numberOfLines={1}>
                {messages?.subject}
              </NativeText>
              <NativeText variant="subtitle" numberOfLines={1}>
                {messages.author}
              </NativeText>
            </View>
            <View>

            </View>
          </View>
        </PapillonModernHeader>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingTop: 70 + 16,
            paddingBottom: useSafeAreaInsets().bottom + 16,
          }}
          style={{flex: 1}}
        >
          <NativeList>
            <NativeItem>
              <RenderHTML
                source={{ html: messages.content.replaceAll(/<\/?font[^>]*>/g, "") }}
                defaultTextProps={{
                  style: {
                    color: theme.colors.text,
                    fontFamily: "medium",
                    fontSize: 16,
                    lineHeight: 22,
                  },
                }}
                contentWidth={300}
              />
            </NativeItem>

          </NativeList>

        </ScrollView></>}

    </View>


  );
};


export default Chat;
