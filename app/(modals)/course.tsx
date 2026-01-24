import TableFlatList from "@/ui/components/TableFlatList";
import { useRoute, useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import { formatDistanceToNow, formatDistanceStrict, formatDistanceToNowStrict } from 'date-fns'
import * as DateLocale from 'date-fns/locale';

import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";

import i18n, { t } from "i18next";
import Reanimated from 'react-native-reanimated';
import * as Papicons from '@getpapillon/papicons';
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import Icon from "@/ui/components/Icon";
import LinearGradient from "react-native-linear-gradient";
import Course from "@/ui/components/Course";
import { getStatusText } from "../(tabs)/calendar/components/CalendarDay";
import { getSubjectName } from '@/utils/subjects/name';
import ModalOverhead from "@/components/ModalOverhead";

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

export default function CourseModal() {
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
          getStatusText(course.status) ? {
            title: t("Modal_Course_Status"),
            hideTitle: true,
            items: [
              {
                title: getStatusText(course.status),
                icon: <Papicons.Info />,
              }
            ]
          } : null,
          {
            title: t("Modal_Course_Time"),
            papicon: <Papicons.Clock />,
            items: [
              {
                title: t("Modal_Course_Start"),
                description: formatDistanceToNow(startTime * 1000, { locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS, addSuffix: true }),
                icon: <Papicons.Logout />,
                trailing: <Typography variant="header">{new Date(startTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric"
                })}</Typography>
              },
              {
                title: t("Modal_Course_End"),
                icon: <Papicons.Login />,
                trailing: <Typography variant="header">{new Date(endTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric"
                })}</Typography>
              }
            ]
          },
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
                description: formatDistanceStrict(startTime * 1000, endTime * 1000, { locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS })
              }
            ]
          }
        ]}
        ListHeaderComponent={
          <ModalOverhead
            subject={getSubjectName(item.subject)}
            title={item.customStatus || getStatusText(item.status)}
            color={subjectInfo.color}
            emoji={subjectInfo.emoji}
            subjectVariant="h3"
            date={new Date(startTime * 1000)}
            dateFormat={{
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric"
            }}
            style={{
              marginBottom: 24,
              marginTop: 24
            }}
          />
        }
        style={{ backgroundColor: "transparent" }}
      />
    </>
  )
}