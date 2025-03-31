import React, {useEffect, useState} from "react";
import { ScrollView, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

import type {Screen} from "@/router/helpers/types";
import {NativeItem, NativeList, NativeListHeader, NativeText,} from "@/components/Global/NativeComponents";
import {useCurrentAccount} from "@/stores/account";
import {ChevronDown } from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import InitialIndicator from "@/components/News/InitialIndicator";
import {getProfileColorByName} from "@/services/local/default-personalization";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import GetAvailableThemes from "@/utils/chat/themes/GetAvailableThemes";
import { ThemesMeta } from "@/utils/chat/themes/Themes.types";
import GetThemeForChatId from "@/utils/chat/themes/GetThemeForChat";
import SetThemeForChatId from "@/utils/chat/themes/SetThemeForChat";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";

const ChatDetails: Screen<"ChatDetails"> = ({ navigation, route }) => {
  const account = useCurrentAccount((state) => state.account!);
  const [maxRecipientsShow, setMaxRecipientsShow] = useState<number>(4);
  const [availableThemes, setAvailableThemes] = useState<ThemesMeta[]>([]);
  const [actualTheme, setActualTheme] = useState<string>("default");

  const theme = useTheme();
  const { colors } = theme;
  const { onThemeChange } = route.params;

  const chat = route.params.handle;
  const recipients = route.params.recipients;
  const creatorName = chat.creator === account.name ? chat.recipient : chat.creator;

  useEffect(() => {
    GetAvailableThemes()
      .then((themes) => {
        setAvailableThemes(themes);
      })
      .catch((error) => {
        console.error("Error fetching themes:", error);
      });
  }, []);

  useEffect(() => {
    GetThemeForChatId(chat.subject)
      .then((theme) => {
        setActualTheme(theme.meta.path);
      })
      .catch((error) => {
        console.error("Error fetching themes:", error);
      });
  }, []);

  const increaseMaxRecipientsShow = () => {
    setMaxRecipientsShow(maxRecipientsShow + 4);
  };

  const updateTheme = async (meta: ThemesMeta) => {
    setActualTheme(meta.path);
    await SetThemeForChatId(chat.subject, meta);

    if (onThemeChange) onThemeChange(meta);
  };

  return (
    <ScrollView>
      <View style={styles.headerContainer}>
        <InitialIndicator
          initial={recipients.length > 2 ? "group":parse_initials(creatorName)}
          color={getProfileColorByName(creatorName).bright}
          textColor={getProfileColorByName(creatorName).dark}
          size={55}
        />
        <View style={{alignItems: "center", maxWidth: "80%"}}>
          <NativeText variant="subtitle">{creatorName}</NativeText>
          <NativeText variant="title" numberOfLines={3} style={{textAlign: "center"}}>{chat.subject}</NativeText>
        </View>
      </View>

      <View style={{paddingHorizontal: 20}}>
        <NativeList>
          <NativeItem onPress={() => navigation.navigate("ChatThemes", {
            handle: chat,
            themes: availableThemes,
            onGoBack: (selectedThemePath) => updateTheme(selectedThemePath),
          })}>
            <View style={styles.themeItem}>
              <View style={{ flex: 1, flexDirection: "row", gap: 10, alignItems: "center" }}>
                <Image
                  source={availableThemes.find(theme => theme.path === actualTheme)?.icon}
                  style={{ width: 35, height: 35, borderRadius: 25 / 2 }}
                />
                <View>
                  <NativeText>Thème</NativeText>
                  <NativeText variant="subtitle">{availableThemes.find(theme => theme.path === actualTheme)?.name}</NativeText>
                </View>
              </View>
            </View>
          </NativeItem>
        </NativeList>
        <NativeListHeader label={"Destinataires (" + recipients.length + ")"}/>
        <NativeList>
          {recipients.slice(0, maxRecipientsShow).map((recipient, index) => (
            <NativeItem
              key={index}
            >
              <View style={{flex: 1, flexDirection: "row", alignItems: "center", gap: 10}}>
                {recipient.name === account.name ? (
                  <Image
                    source={account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== ""
                      ? { uri: account.personalization.profilePictureB64 }
                      : defaultProfilePicture(account.service, "")}
                    style={{ width: 38, height: 38, borderRadius: 38 / 2 }}
                  />
                ) : (
                  <InitialIndicator
                    initial={parse_initials(recipient.name)}
                    color={getProfileColorByName(recipient.name).bright}
                    textColor={getProfileColorByName(recipient.name).dark}
                    size={38}
                  />
                )}
                <NativeText>{recipient.name === account.name ? `${account.studentName.last} ${account.studentName.first}` : recipient.name}</NativeText>
                {recipient.class ? (
                  <View
                    style={[styles.recipientItem, { backgroundColor: colors.primary + "35" }]}
                  >
                    <NativeText color={colors.primary}>{recipient.class}</NativeText>
                  </View>
                ) : null}
              </View>
            </NativeItem>
          ))}
          {recipients.length > maxRecipientsShow ? (
            <NativeItem>
              <TouchableOpacity onPress={increaseMaxRecipientsShow}>
                <View style={{flex: 1, flexDirection: "row", justifyContent:"space-between"}}>
                  <NativeText variant="title">En afficher plus</NativeText>
                  <ChevronDown color={colors.text}/>
                </View>
              </TouchableOpacity>
            </NativeItem>
          ) : null}
        </NativeList>
      </View>
      <InsetsBottomView />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
    gap: 10
  },
  themeItem: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between"
  },

  recipientItem: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5.5,
  }
});

export default ChatDetails;
