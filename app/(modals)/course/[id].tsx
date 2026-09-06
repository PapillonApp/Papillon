import { Papicons } from '@getpapillon/papicons';
import { useTheme } from "expo-router/react-navigation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns'
import * as DateLocale from 'date-fns/locale';
import i18n, { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import ModalOverhead from "@/components/ModalOverhead";
import { getCourseById } from "@/database/useTimetable";
import { Course as SharedCourse } from "@/services/shared/timetable";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import { getSubjectName } from '@/utils/subjects/name';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';

import { getStatusText } from "../../(tabs)/calendar/components/CalendarDay";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SubjectInfo {
  name: string;
  originalName: string;
  emoji: string;
  color: string;
}

export default function CourseModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0
  });
  const [course, setCourse] = useState<SharedCourse>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCourseById(id)
      .then(result => {
        if (!cancelled) setCourse(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>;
  }

  if (!course) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Typography variant="title">{t("Tab_Calendar")}</Typography></View>;
  }

  const subjectInfo: SubjectInfo = {
    name: getSubjectName(course.subject),
    originalName: course.subject,
    emoji: getSubjectEmoji(course.subject),
    color: getSubjectColor(course.subject),
  };
  const item = course;
  const startTime = Math.floor(course.from.getTime() / 1000);
  const endTime = Math.floor(course.to.getTime() / 1000);

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      {Platform.OS === "android" && (
        <NativeHeaderSide side="Left">
          <NativeHeaderPressable onPress={() => router.back()}>
            <Icon size={28}>
              <Papicons name="Cross" />
            </Icon>
          </NativeHeaderPressable>
        </NativeHeaderSide>
      )}

      {Platform.OS !== "android" && (
        <LinearGradient
          colors={[subjectInfo.color, `${subjectInfo.color}00`]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 500,
            width: "100%",
            zIndex: 0,
            opacity: 0.6,
          }}
        />
      )}

      <List
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <ModalOverhead
            subject={getSubjectName(item.subject)}
            title={item.customStatus || getStatusText(item.status)}
            color={Platform.OS === "ios" ? subjectInfo.color : colors.primary}
            emoji={subjectInfo.emoji}
            subjectVariant="h3"
            date={new Date(startTime * 1000)}
            dateFormat={{
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }}
            style={{
              marginBottom: 24,
              paddingTop: finalHeaderHeight,
            }}
          />
        }
        style={{ backgroundColor: "transparent", zIndex: 2 }}
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
            <Typography variant="title">{t("Modal_Course_Start")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {formatDistanceToNow(startTime * 1000, {
                locale:
                  DateLocale[i18n.language as keyof typeof DateLocale] ||
                  DateLocale.enUS,
                addSuffix: true,
              })}
            </Typography>
            <List.Trailing>
              <Typography variant="title">
                {new Date(startTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
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
            <Typography variant="title">{t("Modal_Course_End")}</Typography>
            <List.Trailing>
              <Typography variant="title">
                {new Date(endTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
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
            <Typography variant="title">{t("Modal_Course_Teacher")}</Typography>
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
            <Typography variant="title">{t("Modal_Course_Room")}</Typography>
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
                locale:
                  DateLocale[i18n.language as keyof typeof DateLocale] ||
                  DateLocale.enUS,
              })}
            </Typography>
          </List.Item>
        </List.Section>
      </List>
    </View>
  );
}
