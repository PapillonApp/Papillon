import { useNavigation } from "expo-router";
import { t } from "i18next";
import React from 'react';
import { FlatList } from "react-native";

import { CourseStatus } from "@/services/shared/timetable";
import Course from "@/ui/components/Course";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { useTimetableWidgetData } from "../hooks/useTimetableWidgetData";
import { getStatusText } from '../../calendar/components/CalendarDay';

const HomeTimeTableWidget = React.memo(() => {
  const navigation = useNavigation();
  const { courses } = useTimetableWidgetData();

  if (courses.length === 0) {
    return (
      <Stack
        inline flex
        hAlign="center"
        vAlign="center"
        padding={[22, 16]}
        gap={2}
        style={{ paddingTop: 12 }}
      >
        <Typography align="center" variant="title" color="text">
          {t("Home_Widget_NoCourses")}
        </Typography>
        <Typography align="center" variant="body1" color="secondary">
          {t("Home_Widget_NoCourses_Description")}
        </Typography>
      </Stack>
    );
  }

  return (
    <FlatList
      scrollEnabled={false}
      data={courses.slice(0, 3)}
      style={{ width: '100%', paddingHorizontal: 10 }}
      renderItem={({ item }) => (
        <Course
          key={item.id}
          id={item.id}
          name={getSubjectName(item.subject)}
          teacher={item.teacher}
          room={item.room}
          color={getSubjectColor(item.subject)}
          status={{ label: item.customStatus ? item.customStatus : getStatusText(item.status), canceled: (item.status === CourseStatus.CANCELED) }}
          variant="primary"
          start={Math.floor(item.from.getTime() / 1000)}
          end={Math.floor(item.to.getTime() / 1000)}
          readonly={!!item.createdByAccount}
          compact={true}
          onPress={() => {
            (navigation as any).navigate('(modals)/course', {
              course: item,
              subjectInfo: {
                id: item.id,
                name: item.subject,
                color: getSubjectColor(item.subject),
                emoji: getSubjectEmoji(item.subject),
              }
            });
          }}
        />
      )}
    />
  );
});

export default HomeTimeTableWidget;

