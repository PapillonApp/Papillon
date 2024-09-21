import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, Text, Linking } from "react-native";
import { Homework } from "@/services/shared/Homework";
import { getSubjectData } from "@/services/shared/Subject";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";

import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { FileIcon, FileText, Link, Paperclip } from "lucide-react-native";

import ParsedText from "react-native-parsed-text";

import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";

const HomeworksDocument = ({ route, navigation }) => {
  const theme = useTheme();

  const homework: Homework = route.params.homework || {};
  console.log(homework);

  const openUrl = (url) => {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: "formSheet",
      controlsColor: theme.colors.primary
    });
  };

  const [subjectData, setSubjectData] = useState({
    color: "#888888", pretty: "Matière inconnue", emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [homework.subject]);

  const parsedContent = useMemo(() => parse_homeworks(homework.content), [homework.content]);

  return (
    <ScrollView
      style={{
        padding: 16,
        paddingTop: 0,
        backgroundColor: theme.colors.background,
      }}
    >
      <NativeList inset>
        <NativeItem
          leading={
            <View
              style={{
                backgroundColor: subjectData.color + "23",
                borderRadius: 100,
                width: 42,
                height: 42,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  lineHeight: 42,
                  textAlign: "center",
                  width: "100%",
                  marginLeft: 2,
                  color: theme.colors.text,
                }}
              >
                {subjectData.emoji}
              </Text>
            </View>
          }
        >
          <NativeText variant="title" style={{ color: theme.colors.text }}>
            {subjectData.pretty}
          </NativeText>
          <NativeText variant="subtitle" style={{ color: theme.colors.text }}>
            {formatDistance(
              new Date(homework.due),
              new Date(),
              {
                addSuffix: true,
                locale: fr,
              }
            )}
          </NativeText>
        </NativeItem>
        <NativeItem>
          <ParsedText
            style={{
              fontSize: 16,
              lineHeight: 22,
              fontFamily: "medium",
              color: theme.colors.text
            }}
            parse={
              [
                {
                  type: "url",
                  style: {
                    color: theme.colors.primary,
                    textDecorationLine: "underline",
                  },
                  onPress: (url) => openUrl(url),
                },
                {
                  type: "email",
                  style: {
                    color: theme.colors.primary,
                    textDecorationLine: "underline",
                  },
                  onPress: (url) => Linking.openURL("mailto:" + url),
                },
              ]
            }
          >
            {parsedContent}
          </ParsedText>
        </NativeItem>
      </NativeList>

      {homework.attachments.length > 0 && (
        <View>
          <NativeListHeader label="Pièces jointes" icon={<Paperclip color={theme.colors.text} />} />

          <NativeList>
            {homework.attachments.map((attachment, index) => (
              <NativeItem
                key={index}
                onPress={() => openUrl(attachment.url)}
                icon={
                  attachment.type === "file" ?
                    <FileText color={theme.colors.text} />
                    :
                    <Link color={theme.colors.text} />
                }
              >
                <NativeText variant="title" numberOfLines={2} style={{ color: theme.colors.text }}>
                  {attachment.name}
                </NativeText>
                <NativeText variant="subtitle" numberOfLines={1} style={{ color: theme.colors.text }}>
                  {attachment.url}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        </View>
      )}
    </ScrollView>
  );
};

export default HomeworksDocument;