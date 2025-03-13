import InsetsBottomView from "@/components/Global/InsetsBottomView";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { Information } from "@/services/shared/Information";
import formatDate from "@/utils/format/format_date_complets";
import { useTheme } from "@react-navigation/native";
import {
  Check,
  Eye,
  EyeOff,
  FileIcon,
  Link,
  MoreHorizontal,
  WifiOff,
} from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Linking, TouchableOpacity, type GestureResponderEvent, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import HTMLView from "react-native-htmlview";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { LinearGradient } from "expo-linear-gradient";
import { setNewsRead } from "@/services/news";
import { useCurrentAccount } from "@/stores/account";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { Screen } from "@/router/helpers/types";
import { AttachmentType } from "@/services/shared/Attachment";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { newsInformationAcknowledge } from "pawnote";
import { AccountService } from "@/stores/account/types";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAlert } from "@/providers/AlertProvider";

const NewsItem: Screen<"NewsItem"> = ({ route, navigation }) => {
  const [message, setMessage] = useState<Information>(JSON.parse(route.params.message) as Information);
  const important = route.params.important;
  const isED = route.params.isED;
  const account = useCurrentAccount((store) => store.account!);
  const { isOnline } = useOnlineStatus();
  const { showAlert } = useAlert();

  const theme = useTheme();
  const stylesText = StyleSheet.create({
    body: {
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22,
      color: theme.colors.text,
    },
    a: {
      color: theme.colors.primary,
      textDecorationColor: theme.colors.primary,
      textDecorationLine: "underline",
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: message.title,
    });
  }, [navigation, message.title]);

  useEffect(() => {
    setNewsRead(account, message, true);
    setMessage((prev) => ({
      ...prev,
      read: true,
    }));
  }, [account.instance]);

  const tagsStyles = {
    body: {
      color: theme.colors.text,
    },
    a: {
      color: theme.colors.primary,
      textDecorationColor: theme.colors.primary,
    },
  };

  function onPress (event: GestureResponderEvent, href: string) {
    Linking.openURL(href);
  }

  const renderersProps = {
    a: {
      onPress: onPress,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <PapillonModernHeader native height={110} outsideNav={true}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={{flex: 1, gap: 3}}>
            <NativeText variant="title" numberOfLines={1}>{message.title === "" ? message.author : message.title}</NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>{message.title === "" ? formatDate(message.date.toString()) : message.author}</NativeText>
          </View>
          {!isED && (
            <PapillonPicker
              animated
              direction="right"
              delay={0}
              data={[
                {
                  icon: message.read ? <EyeOff /> : <Eye />,
                  label: message.read
                    ? "Marquer comme non lu"
                    : "Marquer comme lu",
                  onPress: () => {
                    if (isOnline) {
                      setNewsRead(account, message, !message.read);
                      setMessage((prev) => ({
                        ...prev,
                        read: !prev.read,
                      }));
                    } else {
                      showAlert({
                        title: "Information",
                        message: "Tu es hors ligne. Vérifie ta connexion Internet et réessaie",
                        icon: <WifiOff />,
                        actions: [
                          {
                            title: "OK",
                            icon: <Check />,
                          },
                        ],
                      });
                    }
                  },
                },
              ]}
            >
              <TouchableOpacity>
                <MoreHorizontal size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </PapillonPicker>
          )}
        </View>
      </PapillonModernHeader>
      {important && (
        <LinearGradient
          colors={
            !theme.dark
              ? [theme.colors.card, "#BFF6EF"]
              : [theme.colors.card, "#2C2C2C"]
          }
          start={[0, 0]}
          end={[2, 2]}
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            opacity: 0.75,
          }}
        />
      )}
      <ScrollView
        style={{
          flex: 1,
          paddingTop: 106 - 16,
          backgroundColor: theme.colors.background,
        }}
      >
        <View
          style={{
            paddingHorizontal: 16,
          }}
        >

          {account.service === AccountService.Pronote && message.ref.needToAcknowledge ? (
            <NativeList inline
              style={{
                marginBottom: 16,
              }}
            >
              <NativeItem
                leading={
                  <PapillonCheckbox
                    checked={message.acknowledged}
                    onPress={async () => {
                      if (!message.acknowledged && account.instance) {
                        if (isOnline) {
                          await newsInformationAcknowledge(
                            account.instance,
                            message.ref
                          );

                          setMessage((prev) => ({
                            ...prev,
                            read: true,
                            acknowledged: true,
                          }));
                        } else {
                          showAlert({
                            title: "Information",
                            message: "Tu es hors ligne. Vérifie ta connexion Internet et réessaie",
                            icon: <WifiOff />,
                            actions: [
                              {
                                title: "OK",
                                icon: <Check />,
                              },
                            ],
                          });
                        }
                      }
                    }}
                    color={theme.colors.primary}
                  />
                }
              >
                <NativeText variant="body">
                  J'ai lu et pris connaissance
                </NativeText>
                <NativeText variant="subtitle">
                  Tu confirmes avoir lu et ton établissement peut en être notifié.
                </NativeText>
              </NativeItem>
            </NativeList>
          ) : (
            <View style={{ marginBottom: 16 }} />
          )}


          <HTMLView
            value={`<body>${message.content.replaceAll("<p>", "").replaceAll("</p>", "")}</body>`}
            stylesheet={stylesText}
          />
        </View>

        {isED && <ScrollView horizontal={true} contentContainerStyle={{gap: 5, paddingHorizontal: 16}}>
          <View style={{
            padding: 4,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 80,
            borderColor: theme.colors.border,
            marginTop: 16,
          }}>
            <NativeText>{message.category}</NativeText>
          </View>
          <View style={{
            padding: 4,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 80,
            borderColor: theme.colors.border,
            marginTop: 16,
          }}>
            <NativeText>{formatDate(message.date.toString())}</NativeText>
          </View>
        </ScrollView>}

        {message.attachments.length > 0 && (
          <View style={{ paddingHorizontal: 16 }}>
            <NativeListHeader label="Pièces jointes" />
            <NativeList>
              {message.attachments.map((attachment, index) => (
                <NativeItem
                  key={index}
                  chevron={false}
                  onPress={() => Linking.openURL(attachment.url)}
                  icon={
                    attachment.type === AttachmentType.File ? (
                      <FileIcon />
                    ) : (
                      <Link />
                    )
                  }
                >
                  <NativeText variant="title" numberOfLines={1}>
                    {attachment.name}
                  </NativeText>
                  <NativeText variant="subtitle" numberOfLines={1}>
                    {attachment.url}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </View>
        )}

        <InsetsBottomView />
        <InsetsBottomView />
        <InsetsBottomView />
      </ScrollView>
    </View>
  );
};

export default NewsItem;
