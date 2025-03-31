import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { HomeworkReturnType } from "@/services/shared/Homework";
import * as WebBrowser from "expo-web-browser";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import HTMLView from "react-native-htmlview";
import { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import getAndOpenFile from "@/utils/files/getAndOpenFile";
import { AutoFileIcon } from "@/components/Global/FileIcon";
import { Paperclip, CircleAlert, PencilLine, MoreHorizontal, Trash2 } from "lucide-react-native";
import LinkFavicon, { getURLDomain } from "@/components/Global/LinkFavicon";
import { timestampToString } from "@/utils/format/DateHelper";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { getSubjectData } from "@/services/shared/Subject";
import { useHomeworkStore } from "@/stores/homework";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

const HomeworksDocument: Screen<"HomeworksDocument"> = ({ navigation, route }) => {
  const theme = useTheme();
  const stylesText = StyleSheet.create({
    body: {
      color: theme.colors.text,
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22,
    },
    a: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
    },
  });

  const account = useCurrentAccount((store) => store.account!);

  const homework = route.params.homework;

  const openUrl = (url: string) => {
    if (
      account.service === AccountService.EcoleDirecte &&
			Platform.OS === "ios"
    ) {
      getAndOpenFile(account, url);
    } else {
      WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: theme.colors.primary,
      });
    }
  };

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [homework.subject]);

  return (
    <View style={{ flex: 1 }}>
      <PapillonModernHeader native outsideNav={true}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              marginRight: 4,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                textAlign: "center",
                width: "100%",
                marginLeft: 2,
              }}
            >
              {subjectData.emoji}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <NativeText variant="title" numberOfLines={1}>
              {subjectData.pretty}
            </NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>
              {timestampToString(new Date(homework.due).getTime())}
            </NativeText>
          </View>
          <View>
            {homework.returnType && (
              <View
                style={{
                  backgroundColor: "#D10000",
                  borderRadius: 100,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 8,
                  paddingHorizontal: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      homework.returnType === "file_upload"
                        ? "Tu dois rendre ce devoir sur ton ENT"
                        : homework.returnType === "paper"
                          ? "Tu dois rendre ce devoir en classe"
                          : "Ce devoir est à rendre",
                      homework.returnType === "file_upload"
                        ? "Papillon ne permet pas de rendre des devoirs sur l'ENT. Tu dois le faire sur l'ENT de ton établissement."
                        : "Ton professeur t'indiquera comment rendre ce devoir.",
                    );
                  }}
                >
                  <NativeText
                    variant="subtitle"
                    style={{ color: "#FFF", opacity: 1 }}
                  >
                    {homework.returnType === HomeworkReturnType.FileUpload
                      ? "A rendre sur l'ENT"
                      : homework.returnType === HomeworkReturnType.Paper
                        ? "A rendre en classe"
                        : null}
                  </NativeText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {homework.personalizate && (
            <PapillonPicker
              animated
              direction="right"
              delay={0}
              data={[
                {
                  icon: <PencilLine />,
                  label: "Modifier le devoir",
                  sfSymbol: "pencil",
                  onPress: () => {
                    navigation.navigate("AddHomework", {
                      hwid: homework.id,
                      modal: true,
                    });
                  },
                },
                {
                  icon: <Trash2 />,
                  label: "Supprimer le devoir",
                  sfSymbol: "trash",
                  destructive: true,
                  onPress: () => {
                    Alert.alert(
                      "Supprimer le devoir",
                      "Veux-tu vraiment supprimer ce devoir ?",
                      [
                        {
                          text: "Annuler",
                          isPreferred: true,
                        },
                        {
                          text: "Continuer",
                          style: "destructive",
                          onPress: () => {
                            useHomeworkStore
                              .getState()
                              .removeHomework(
                                dateToEpochWeekNumber(new Date(homework.due)),
                                homework.id,
                              );
                            navigation.goBack();
                          }
                        }
                      ]
                    );
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

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 70 + 16,
          paddingBottom: useSafeAreaInsets().bottom + 16,
        }}
        style={{ flex: 1 }}
      >
        <NativeList>
          {homework.exam ? (
            <NativeItem icon={<CircleAlert />}>
              <NativeText variant="default">{"Évaluation"}</NativeText>
            </NativeItem>
          ) : (
            <></>
          )}

          <NativeItem>
            <HTMLView
              value={`<body>${parse_homeworks(homework.content)}</body>`}
              stylesheet={stylesText}
              onLinkPress={(url) => openUrl(url)}
            />
          </NativeItem>
        </NativeList>

        {homework.attachments.length > 0 && (
          <View>
            <NativeListHeader label="Pièces jointes" icon={<Paperclip />} />

            <NativeList>
              {homework.attachments.map((attachment, index) => (
                <NativeItem
                  key={index}
                  onPress={() => openUrl(attachment.url)}
                  icon={attachment.type === "file" ? <AutoFileIcon filename={attachment.name} /> : <LinkFavicon url={attachment.url} />}
                >
                  <NativeText variant="title" numberOfLines={2}>
                    {attachment.name || getURLDomain(attachment.url, true)}
                  </NativeText>
                  <NativeText variant="subtitle" numberOfLines={1}>
                    {attachment.url}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeworksDocument;
