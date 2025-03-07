import React, { useEffect, useRef, useState } from "react";
import { Image, ActivityIndicator, FlatList, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, } from "react-native";
import { useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import { NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import type { ChatMessage, ChatRecipient } from "@/services/shared/Chat";
import { ChevronLeft, Send } from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import InitialIndicator from "@/components/News/InitialIndicator";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HTMLView from "react-native-htmlview";
import Reanimated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { AccountService } from "@/stores/account/types";
import * as WebBrowser from "expo-web-browser";
import { WebBrowserPresentationStyle } from "expo-web-browser";
import getAndOpenFile from "@/utils/files/getAndOpenFile";
import { getProfileColorByName } from "@/services/local/default-personalization";
import { getChatMessages, sendMessageInChat, getChatRecipients } from "@/services/chats";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import MissingItem from "@/components/Global/MissingItem";
import { animPapillon } from "@/utils/ui/animations";
import GetThemeForChatId from "@/utils/chat/themes/GetThemeForChat";
import { Theme } from "@/utils/chat/themes/Themes.types";
import { type Attachment, AttachmentType } from "@/services/shared/Attachment";
import { AutoFileIcon } from "@/components/Global/FileIcon";
import LinkFavicon from "@/components/Global/LinkFavicon";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const Chat: Screen<"Chat"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const stylesText = StyleSheet.create({
    body: {
      color: colors.text,
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22,
    },
    a: {
      textDecorationLine: "underline",
    },
  });

  const stylesTextAuthor = StyleSheet.create({
    body: {
      color: "#FFF",
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22
    },
    a: {
      textDecorationLine: "underline",
    },
  });

  const account = useCurrentAccount((state) => state.account!);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState<string>("");
  const [recipients, setRecipients] = useState<ChatRecipient[]>([]);
  const [chatTheme, setActualTheme] = useState<Theme>();

  const creatorName = route.params.handle.creator === account.name ? route.params.handle.recipient : route.params.handle.creator;
  const backgroundImage = theme.dark
    ? { uri: `${chatTheme?.darkModifier.chatBackgroundImage}` }
    : { uri: `${chatTheme?.lightModifier.chatBackgroundImage}` };

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
      const recipients = await getChatRecipients(account, route.params.handle);
      const theme = await GetThemeForChatId(route.params.handle.subject);
      setMessages(messages);
      setRecipients(recipients);
      setActualTheme(theme);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    })();
  }, [route.params.handle]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, flatListRef.current]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {messages[0] ? (
        <>
          <PapillonModernHeader height={130} outsideNav={true} tint={theme.dark ? chatTheme?.darkModifier.headerBackgroundColor : chatTheme?.lightModifier.headerBackgroundColor}>
            <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ChevronLeft color={
                  (theme.dark ? chatTheme?.darkModifier.headerTextColor : chatTheme?.lightModifier.headerTextColor + "80")
                } size={26}  />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("ChatDetails", {
                  handle: route.params.handle,
                  recipients: recipients,
                  onThemeChange: async (updatedTheme) => {
                    const theme = await GetThemeForChatId(route.params.handle.subject);
                    setActualTheme(theme);
                  }
                })}
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                <InitialIndicator
                  initial={recipients.length > 2 ? "group":parse_initials(creatorName)}
                  color={getProfileColorByName(creatorName).bright}
                  textColor={getProfileColorByName(creatorName).dark}
                  size={38}
                />
                <View style={{flex: 1}}>
                  <NativeText
                    variant="subtitle"
                    color={theme.dark ? chatTheme?.darkModifier.headerTextColor : chatTheme?.lightModifier.headerTextColor}
                  >
                    {route.params.handle.subject ? creatorName: "Conversation avec"}
                  </NativeText>
                  <NativeText
                    variant="title"
                    numberOfLines={1}
                    style={{
                      maxWidth: 250
                    }}
                    color={theme.dark ? chatTheme?.darkModifier.headerTextColor : chatTheme?.lightModifier.headerTextColor}
                  >
                    {route.params.handle.subject || creatorName}
                  </NativeText>
                </View>
              </TouchableOpacity>
            </View>
          </PapillonModernHeader>
          <ImageBackground
            source={backgroundImage}
            style={{ flex: 1 }}
          >
            <FlatList
              ref={flatListRef}
              data={[...messages]}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{
                padding: 16,
                paddingTop: 120
              }}
              style={{
                flex: 1,
                backgroundColor: chatTheme?.darkModifier.chatBackgroundImage
                  ? undefined
                  : theme.dark
                    ? chatTheme?.darkModifier.chatBackgroundColor
                    : chatTheme?.lightModifier.chatBackgroundColor,
              }}
              renderItem={({ item, index }) => {
                const isFirst = index === 0 || messages[index-1].author !== item.author;
                const isMiddle: boolean = (messages[index - 1] && messages[index + 1] && messages[index - 1].author === item.author && messages[index + 1].author === item.author) ?? false;
                const isLast = (index === messages.length - 1 || messages[index + 1] && messages[index + 1].author !== item.author);

                const authorIsUser = item.author === account.name;
                let borderStyle = {
                  borderTopLeftRadius: theme.dark ? chatTheme?.darkModifier.receivedMessageborderRadiusDefault : chatTheme?.lightModifier.receivedMessageborderRadiusDefault,
                  borderTopRightRadius: theme.dark ? chatTheme?.darkModifier.receivedMessageborderRadiusDefault : chatTheme?.lightModifier.receivedMessageborderRadiusDefault,
                  borderBottomLeftRadius: theme.dark ? chatTheme?.darkModifier.receivedMessageborderRadiusDefault : chatTheme?.lightModifier.receivedMessageborderRadiusDefault,
                  borderBottomRightRadius: theme.dark ? chatTheme?.darkModifier.receivedMessageborderRadiusDefault : chatTheme?.lightModifier.receivedMessageborderRadiusDefault,
                };

                if (isFirst && !isLast) {
                  borderStyle.borderBottomLeftRadius = theme.dark ? chatTheme?.darkModifier.receivedMessageBorderRadiusLinked : chatTheme?.lightModifier.receivedMessageBorderRadiusLinked;
                }

                if (isMiddle) {
                  borderStyle.borderBottomLeftRadius = theme.dark ? chatTheme?.darkModifier.receivedMessageBorderRadiusLinked : chatTheme?.lightModifier.receivedMessageBorderRadiusLinked;
                  borderStyle.borderTopLeftRadius = theme.dark ? chatTheme?.darkModifier.receivedMessageBorderRadiusLinked : chatTheme?.lightModifier.receivedMessageBorderRadiusLinked;
                }

                if (isLast && !isFirst) {
                  borderStyle.borderBottomLeftRadius = theme.dark ? chatTheme?.darkModifier.receivedMessageBorderRadiusLinked : chatTheme?.lightModifier.receivedMessageborderRadiusDefault;
                  borderStyle.borderTopLeftRadius = theme.dark ? chatTheme?.darkModifier.receivedMessageBorderRadiusLinked : chatTheme?.lightModifier.receivedMessageBorderRadiusLinked;
                }

                if (authorIsUser) {
                  borderStyle = {
                    ...borderStyle,
                    borderTopLeftRadius: borderStyle.borderTopRightRadius,
                    borderTopRightRadius: borderStyle.borderTopLeftRadius,
                    borderBottomLeftRadius: borderStyle.borderBottomRightRadius,
                    borderBottomRightRadius: borderStyle.borderBottomLeftRadius,
                  };
                }

                return (
                  <View style={{ gap: 10 }}>
                    {!isFirst ? null : (
                      <View style={{ flex: 1, flexDirection: item.author === account.name ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
                        {authorIsUser ? (
                          <Image
                            source={account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== ""
                              ? { uri: account.personalization.profilePictureB64 }
                              : defaultProfilePicture(account.service, "")}
                            style={{ width: 25, height: 25, borderRadius: 25 / 2 }}
                          />
                        ) : (
                          <InitialIndicator
                            initial={parse_initials(item.author)}
                            color={getProfileColorByName(item.author).bright}
                            textColor={getProfileColorByName(item.author).dark}
                            size={25}
                          />
                        )}
                        <NativeText variant="subtitle">{ authorIsUser ? `${account.studentName.last} ${account.studentName.first}` : item.author}</NativeText>
                        <View style={{ width: 5, height: 5, backgroundColor: colors.text + "65", borderRadius: 5 }} />
                        <NativeText variant="subtitle">
                          {item.date.toLocaleString("fr-FR", {
                            hour12: false,
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </NativeText>
                      </View>
                    )}
                    <View style={{
                      marginBottom: 10,
                      padding: 15,
                      backgroundColor: authorIsUser ? theme.dark ? chatTheme?.darkModifier.sentMessageBackgroundColor : chatTheme?.lightModifier.sentMessageBackgroundColor : theme.dark ? chatTheme?.darkModifier.receivedMessageBackgroundColor : chatTheme?.lightModifier.receivedMessageBackgroundColor,
                      borderColor: authorIsUser ? theme.dark ? chatTheme?.darkModifier.sentMessageBorderColor : chatTheme?.lightModifier.sentMessageBorderColor : theme.dark ? chatTheme?.darkModifier.receivedMessageBorderColor : chatTheme?.lightModifier.receivedMessageBorderColor,
                      borderWidth: authorIsUser ? theme.dark ? chatTheme?.darkModifier.sentMessageBorderSize : chatTheme?.lightModifier.sentMessageBorderSize : theme.dark ? chatTheme?.darkModifier.receivedMessageBorderSize : chatTheme?.lightModifier.receivedMessageBorderSize,
                      alignSelf: authorIsUser ? "flex-end" : "flex-start",
                      ...borderStyle,
                      gap: 5,
                      position: "relative",
                      maxWidth: "87%",
                    }}>
                      {item.content.trim() !== "" && (
                        <HTMLView
                          value={`<body>${item.content.replaceAll(/<\/?font[^>]*>/g, "")}</body>`}
                          stylesheet={authorIsUser ? stylesTextAuthor : stylesText}
                          onLinkPress={(url) => openUrl(url)}
                        />
                      )}
                      {item.attachments && item.attachments.length > 0 && (
                        <View
                          style={{
                            marginTop: 10,
                            gap: 12,
                          }}
                        >
                          {item.attachments.map((attachment: Attachment) => (
                            <TouchableOpacity onPress={() => openUrl(attachment.url)}>
                              <View style={{flexDirection: "row", alignItems: "center", gap: 10, maxWidth: "90%"}}>
                                <View>
                                  {attachment.type === AttachmentType.File ? (
                                    <AutoFileIcon filename={attachment.name} size={28} color={colors.text} opacity={0.7}/>
                                  ) : (
                                    <LinkFavicon size={28} url={attachment.url} />
                                  )}
                                </View>
                                <View
                                  style={{
                                    gap: 2,
                                  }}
                                >
                                  <NativeText>{attachment.name}</NativeText>
                                  <NativeText variant="subtitle" numberOfLines={1}>{attachment.url}</NativeText>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      {isLast && authorIsUser && (
                        <View style={{ position: "absolute", bottom: 2, right: 0, zIndex: 10, pointerEvents: "none" }}>
                          <View
                            style={{
                              width: 17,
                              height: 17,
                              backgroundColor: theme.dark ? chatTheme?.darkModifier.sentMessageBackgroundColor : chatTheme?.lightModifier.sentMessageBackgroundColor,
                              borderRadius: 15,
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                            }}
                          />

                          <View
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: theme.dark ? chatTheme?.darkModifier.sentMessageBackgroundColor : chatTheme?.lightModifier.sentMessageBackgroundColor ,
                              borderRadius: 15,
                              position: "absolute",
                              bottom: -7,
                              right: -7,
                            }}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={() => (
                <MissingItem
                  emoji="💬"
                  title="C'est le début de la conversation"
                  description="Envoie un message pour commencer la discussion."
                  entering={animPapillon(FadeInDown)}
                  exiting={animPapillon(FadeOut)}
                  style={{paddingVertical: 26}}
                />
              )}
            />
            <View
              style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderTopWidth: 0.5,
                borderTopColor: colors.text + "22",
                backgroundColor: theme.dark ? chatTheme?.darkModifier.inputBarBackgroundColor : chatTheme?.lightModifier.inputBarBackgroundColor,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >

              <ResponsiveTextInput
                placeholder={"Envoyer un message à " + creatorName}
                placeholderTextColor={colors.text + "60"}
                style={{
                  backgroundColor: "transparent",
                  borderRadius: 25,
                  flex: 1,
                  marginRight: 10,
                  fontSize: 16,
                  color: colors.text,
                  fontFamily: "medium",
                }}
                multiline={true}
                onChangeText={(text) => setText(text)}
                value={text}
              />
              <View
                style={{
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.dark ? chatTheme?.darkModifier.sendButtonBackgroundColor : chatTheme?.lightModifier.sendButtonBackgroundColor,
                    width: 56,
                    height: 40,
                    borderRadius: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: -5
                  }}
                  onPress={() => {
                    sendMessageInChat(account, route.params.handle, text);
                  }}
                >
                  <Send color={"#FFF"} size={24} style={{marginTop: 1, marginLeft: -3}}/>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{height: insets.bottom, backgroundColor: theme.dark ? chatTheme?.darkModifier.inputBarBackgroundColor : chatTheme?.lightModifier.inputBarBackgroundColor }}></View>
          </ImageBackground>
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
            Tes conversations arrivent...
          </Text>
        </Reanimated.View>
      )}
    </KeyboardAvoidingView>
  );
};

export default Chat;
