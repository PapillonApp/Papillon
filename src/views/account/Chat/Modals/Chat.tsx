import React, {useEffect, useState} from "react";
import {ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View,} from "react-native";
import {useTheme} from "@react-navigation/native";

import type {Screen} from "@/router/helpers/types";
import {NativeItem, NativeList, NativeListHeader, NativeText,} from "@/components/Global/NativeComponents";
import {useCurrentAccount} from "@/stores/account";
import type {ChatMessage} from "@/services/shared/Chat";
import {FileText, Link, Paperclip} from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import InitialIndicator from "@/components/News/InitialIndicator";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import HTMLView from "react-native-htmlview";
import Reanimated, {FadeIn, FadeOut} from "react-native-reanimated";
import {AccountService} from "@/stores/account/types";
import * as WebBrowser from "expo-web-browser";
import {WebBrowserPresentationStyle} from "expo-web-browser";
import getAndOpenFile from "@/utils/files/getAndOpenFile";
import {getProfileColorByName} from "@/services/local/default-personalization";
import {getChatMessages} from "@/services/chats";

const Chat: Screen<"Chat"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;

  const stylesText = StyleSheet.create({
    body: {
      color: theme.colors.text,
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22,
    }
  });

  const account = useCurrentAccount((state) => state.account!);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const openUrl = (url: string) => {
    if (
      account.service === AccountService.EcoleDirecte &&
			Platform.OS === "ios"
    ) {
      navigation.goBack();
      getAndOpenFile(account, url);
    } else {
      WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: theme.colors.primary,
      });
    }
  };

  useEffect(() => {
    void (async () => {
      const messages = await getChatMessages(account, route.params.handle);
      setMessages(messages);
    })();
  }, [route.params.handle]);

  return (
    <View style={{ flex: 1 }}>
      {messages[0] ? (
        <>
          <PapillonModernHeader outsideNav={true}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 100,
                }}
              >
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
                    initial={parse_initials(messages[0].author)}
                    color={getProfileColorByName(messages[0].author).bright}
                    textColor={getProfileColorByName(messages[0].author).dark}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <NativeText variant="title" numberOfLines={1}>
                  {messages[0]?.subject}
                </NativeText>
                <NativeText variant="subtitle" numberOfLines={1}>
                  {messages[0].author}
                </NativeText>
              </View>
              <View></View>
            </View>
          </PapillonModernHeader>

          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingTop: 70 + 16,
              paddingBottom: useSafeAreaInsets().bottom + 16,
            }}
            style={{ flex: 1 }}
          >
            <NativeList>
              <NativeItem>
                <HTMLView
                  value={`<body>${messages[0].content.replaceAll(
                    /<\/?font[^>]*>/g,
                    ""
                  )}</body>`}
                  stylesheet={stylesText}
                />
              </NativeItem>
            </NativeList>
            {messages[0].attachments.length > 0 && (
              <View>
                <NativeListHeader label="Pièces jointes" icon={<Paperclip />} />

                <NativeList>
                  {messages[0].attachments.map((attachment, index) => (
                    <NativeItem
                      key={index}
                      onPress={() => openUrl(attachment.url)}
                      icon={
                        attachment.type === "file" ? <FileText /> : <Link />
                      }
                    >
                      <NativeText variant="title" numberOfLines={2}>
                        {attachment.name}
                      </NativeText>
                    </NativeItem>
                  ))}
                </NativeList>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
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
      )}
    </View>
  );
};

export default Chat;
