import { CompactGrade } from "@/ui/components/CompactGrade";
import TableFlatList from "@/ui/components/TableFlatList";
import { useRoute, useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";
import { View } from "react-native";

import { formatDistanceToNow, formatDistance, formatDistanceStrict } from 'date-fns'
import { fr } from 'date-fns/locale';

import { Course as SharedCourse, CourseDay, CourseStatus } from "@/services/shared/timetable";
import { Subject as SharedSubject } from "@/services/shared/grade";

import { t } from "i18next";
import Reanimated from 'react-native-reanimated';
import * as Papicons from '@getpapillon/papicons';
import ContainedNumber from "@/ui/components/ContainedNumber";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import Icon from "@/ui/components/Icon";
import LinearGradient from "react-native-linear-gradient";
import Course from "@/ui/components/Course";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getStatusText } from "../(tabs)/calendar";
import { getSubjectEmoji } from "@/utils/subjects/emoji";

interface SubjectInfo {
  name: string;
  originalName: string;
  emoji: string;
  color: string;
}

interface GradesModalProps {
  course: SharedCourse;
  subjectInfo: SubjectInfo;
}

const CourseModal: React.FC<GradesModalProps> = () => {
  const { params } = useRoute();
  const { colors } = useTheme();

  if (!params) {
    return null;
  }

  const { course, subjectInfo } = params as GradesModalProps;
  const item = course;

  const startTime = Math.floor(course.from.getTime() / 1000);
  const endTime = Math.floor(course.to.getTime() / 1000);

  return (
    <>
      <LinearGradient
        colors={[subjectInfo.color, colors.background]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 500,
          width: "100%",
          zIndex: -9,
          opacity: 0.6
        }}
      />

      <TableFlatList
        sections={[
          {
            title: t("Modal_Course_Details"),
            papicon: <Papicons.Info />,
            items: [
              {
                papicon: <Papicons.User />,
                title: t("Modal_Course_Teacher"),
                description: item.teacher
              },
              {
                papicon: <Papicons.MapPin />,
                title: t("Modal_Course_Room"),
                description: item.room
              },
              {
                papicon: <Papicons.Clock />,
                title: t("Modal_Course_Duration"),
                description: formatDistanceStrict(startTime * 1000, endTime * 1000, { locale: fr })
              }
            ]
          }
        ]}
        ListHeaderComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              marginBottom: 20,
            }}
          >
            <Reanimated.View>
              <Course
                id={item.id}
                name={item.subject}
                teacher={item.teacher}
                room={item.room}
                color={getSubjectColor(item.subject)}
                status={{ label: item.customStatus ? item.customStatus : getStatusText(item.status), canceled: (item.status === CourseStatus.CANCELED) }}
                variant="primary"
                start={Math.floor(item.from.getTime() / 1000)}
                end={Math.floor(item.to.getTime() / 1000)}
                readonly={!!item.createdByAccount}
                timesRendered={false}
              />
            </Reanimated.View>

            <Stack
              card
              direction="horizontal"
              width={"100%"}
              style={{ marginTop: 8 }}
            >
              <View style={{
                flexDirection: "row",
                width: "100%",
              }}>
                <Stack
                  vAlign="center"
                  hAlign="center"
                  style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }}
                  padding={12}
                  gap={0}
                >
                  <Icon papicon opacity={0.5}>
                    <Papicons.Clock />
                  </Icon>
                  <Typography color="secondary">
                    {startTime * 1000 > Date.now()
                      ? t("Modal_Course_StartsIn")
                      : endTime * 1000 > Date.now()
                        ? t("Modal_Course_Ongoing")
                        : t("Modal_Course_StartedAgo")}
                  </Typography>
                  <Typography inline variant="h5" color={subjectInfo.color} style={{ marginTop: 4 }}>
                    {formatDistanceToNow(startTime * 1000, { locale: fr })}
                  </Typography>
                </Stack>
                <Stack
                  style={{ flex: 1 }}
                  vAlign="center"
                  hAlign="center"
                  padding={12}
                  gap={0}
                >
                  <Icon papicon opacity={0.5}>
                    <Papicons.Apple />
                  </Icon>
                  <Typography color="secondary">
                    {t("Modal_Course_Group")}
                  </Typography>
                  <Typography inline variant="h5" color={subjectInfo.color} style={{ marginTop: 4 }}>
                    {item.group || t("Modal_Course_Group_Full")}
                  </Typography>
                </Stack>
              </View>
            </Stack>
          </View>
        }
        style={{ backgroundColor: "transparent" }}
      />
    </>
  )
}

export default CourseModal;