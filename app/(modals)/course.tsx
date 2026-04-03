import { Papicons } from '@getpapillon/papicons';
import { useRoute, useTheme } from "@react-navigation/native";
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns'
import * as DateLocale from 'date-fns/locale';
import i18n, { t } from "i18next";
import React from "react";
import { Platform } from 'react-native';
import LinearGradient from "react-native-linear-gradient";

import ModalOverhead from "@/components/ModalOverhead";
import { Course as SharedCourse } from "@/services/shared/timetable";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getSubjectName } from '@/utils/subjects/name';

import { getStatusText } from "../(tabs)/calendar/components/CalendarDay";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0
  });

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

      <List
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
              marginTop: 24,
              paddingTop: finalHeaderHeight
            }}
          />
        }
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={{ padding: 16 }}
      >
        {getStatusText(course.status) ? (
          <List.Section>
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="Info" />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {getStatusText(course.status)}
              </Typography>
            </List.Item>
          </List.Section>
        ) : null}

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Course_Time")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Logout" />
              </Icon>
            </List.Leading>
            <Typography variant="title">
              {t("Modal_Course_Start")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {formatDistanceToNow(startTime * 1000, {
                locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                addSuffix: true
              })}
            </Typography>
            <List.Trailing>
              <Typography variant="title">
                {new Date(startTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric"
                })}
              </Typography>
            </List.Trailing>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Login" />
              </Icon>
            </List.Leading>
            <Typography variant="title">
              {t("Modal_Course_End")}
            </Typography>
            <List.Trailing>
              <Typography variant="title">
                {new Date(endTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric"
                })}
              </Typography>
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Course_Details")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="User" />
              </Icon>
            </List.Leading>
            <Typography variant="title">
              {t("Modal_Course_Teacher")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {item.teacher}
            </Typography>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="MapPin" />
              </Icon>
            </List.Leading>
            <Typography variant="title">
              {t("Modal_Course_Room")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {item.room || t("No_Course_Room")}
            </Typography>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Clock" />
              </Icon>
            </List.Leading>
            <Typography variant="title">
              {t("Modal_Course_Duration")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {formatDistanceStrict(startTime * 1000, endTime * 1000, {
                locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS
              })}
            </Typography>
          </List.Item>
        </List.Section>
      </List>
    </>
  )
}
