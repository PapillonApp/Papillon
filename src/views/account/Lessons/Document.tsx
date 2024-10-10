import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {View, ScrollView, Text, TouchableOpacity, Alert} from "react-native";
import { Homework, HomeworkReturnType } from "@/services/shared/Homework";
import { getSubjectData } from "@/services/shared/Subject";
import { Screen } from "@/router/helpers/types";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, DoorOpen, FileText, Hourglass, Info, Link, Paperclip, PersonStanding } from "lucide-react-native";

import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";
import RenderHTML from "react-native-render-html";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import { TimetableClass } from "@/services/shared/Timetable";

const lz = (num: number) => (num < 10 ? `0${num}` : num);

const getDuration = (minutes: number): string => {
  const durationHours = Math.floor(minutes / 60);
  const durationRemainingMinutes = minutes % 60;
  return `${durationHours}h ${lz(durationRemainingMinutes)} min`;
};

const LessonDocument: Screen<"LessonDocument"> = ({ route, navigation }) => {
  const theme = useTheme();

  const lesson = route.params.lesson as unknown as TimetableClass;

  const [subjectData, setSubjectData] = useState({
    color: "#888888", pretty: "Matière inconnue", emoji: "❓",
  });

  const fetchSubjectData = () => {
    console.log("Fetching subject data for", lesson);
    const data = getSubjectData(lesson.title || "");
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [lesson.subject]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: subjectData.pretty,
    });
  }, [navigation, subjectData]);

  const informations = [
    {
      title: "Durée et horaires",
      informations: [
        {
          icon: <Clock />,
          text: "Début du cours",
          value: formatDistance(
            new Date(lesson.startTimestamp),
            new Date(),
            {
              addSuffix: true,
              locale: fr,
            }
          ) + " (à " + new Date(lesson.startTimestamp).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit", hour12: false}) + ")",
          enabled: lesson.startTimestamp != null,
        },
        {
          icon: <Hourglass />,
          text: "Durée du cours",
          value: getDuration(Math.round((lesson.endTimestamp - lesson.startTimestamp) / 60000)),
          enabled: lesson.endTimestamp != null,
        }
      ]
    },
    {
      title: "Contexte",
      informations: [
        {
          icon: <DoorOpen />,
          text: "Salle de classe",
          value: lesson.room,
          enabled: lesson.room != null,
        },
        {
          icon: <PersonStanding />,
          text: "Professeur",
          value: lesson.teacher,
          enabled: lesson.teacher != null,
        },
      ]
    },
    {
      title: "Statut",
      informations: [
        {
          icon: <Info />,
          text: "Statut",
          value: lesson.statusText,
          enabled: lesson.status != null,
        },
      ]
    }
  ];

  return (
    <>
      <PapillonModernHeader outsideNav={true} startLocation={0.6} height={110}>
        <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
          <View style={{backgroundColor: theme.colors.background, borderRadius: 100}}>
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
                  marginLeft: 2
                }}
              >
                {subjectData.emoji}
              </Text>
            </View>
          </View>
          <View style={{flex: 1, gap: 3}}>
            <NativeText variant="title" numberOfLines={1}>
              {subjectData.pretty}
            </NativeText>
            {lesson.itemType && (
              <NativeText variant="subtitle" numberOfLines={1}>
                {lesson.itemType}
              </NativeText>
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
        style={{flex: 1}}
      >
        {informations.map((info, index) => {
          if (info.informations.filter(item => item.enabled).length === 0) {
            return null;
          }

          return (
            <View key={index}>
              <NativeListHeader label={info.title} key={index} />

              <NativeList>
                {info.informations.map((item, index) => {
                  if (!item.enabled) {
                    return null;
                  }

                  return (
                    <NativeItem
                      key={index}
                      icon={item.icon}
                    >
                      <NativeText variant="subtitle">
                        {item.text}
                      </NativeText>
                      <NativeText variant="default">
                        {item.value}
                      </NativeText>
                    </NativeItem>
                  );
                })}
              </NativeList>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
};

export default LessonDocument;