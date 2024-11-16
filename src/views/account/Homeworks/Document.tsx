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
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { Homework, HomeworkReturnType } from "@/services/shared/Homework";
import { getSubjectData } from "@/services/shared/Subject";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Link, Paperclip, CircleAlert } from "lucide-react-native";

import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";
import HTMLView from "react-native-htmlview";
import { Screen } from "@/router/helpers/types";
import { WebBrowserPresentationStyle } from "expo-web-browser/src/WebBrowser.types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import getAndOpenFile from "@/utils/files/getAndOpenFile";

const HomeworksDocument: Screen<"HomeworksDocument"> = ({ route }) => {
  const theme = useTheme();
  const stylesText = StyleSheet.create({
    body: {
      color: theme.colors.text,
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22,
    }
  });

  const homework: Homework = route.params.homework || {};
  const account = useCurrentAccount((store) => store.account!);

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
              {formatDistance(new Date(homework.due), new Date(), {
                addSuffix: true,
                locale: fr,
              })}
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
                        ? "Vous devez rendre ce devoir sur votre ENT"
                        : homework.returnType === "paper"
                          ? "Vous devrez rendre ce devoir en classe"
                          : "Ce devoir est à rendre",
                      homework.returnType === "file_upload"
                        ? "Papillon ne permet pas de rendre des devoirs sur l'ENT. Vous devez le faire sur l'ENT de votre établissement"
                        : homework.returnType === "paper"
                          ? "Votre professeur vous indiquera comment rendre ce devoir"
                          : "Votre professeur vous indiquera comment rendre ce devoir",
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
            <HTMLView value={`<body>${homework.content}</body>`} stylesheet={stylesText} />
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
                  icon={attachment.type === "file" ? <FileText /> : <Link />}
                >
                  <NativeText variant="title" numberOfLines={2}>
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
      </ScrollView>
    </View>
  );
};

export default HomeworksDocument;
