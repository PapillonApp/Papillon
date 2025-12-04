import Course from "@/ui/components/Course";
import Stack from "@/ui/components/Stack";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectName } from "@/utils/subjects/name";
import { Papicons } from "@getpapillon/papicons";
import { getStatusText } from "../../calendar";
import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";
import { useNavigation } from "expo-router";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { useTimetable } from "@/database/useTimetable";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { useAccountStore } from "@/stores/account";
import Typography from "@/ui/components/Typography";
import { FlatList } from "react-native";
import Icon from "@/ui/components/Icon";

const HomeTimeTableWidget = () => {
  const navigation = useNavigation();

  const now = new Date();
  const weekNumber = getWeekNumberFromDate(now)

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const services = useMemo(() =>
    account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account?.services]
  );

  const [courses, setCourses] = useState<SharedCourse[]>([]);

  const timetableData = useTimetable(undefined, weekNumber);
  const weeklyTimetable = useMemo(() =>
    timetableData.map(day => ({
      ...day,
      courses: day.courses.filter(course =>
        services.includes(course.createdByAccount) || course.createdByAccount.startsWith('ical_')
      )
    })).filter(day => day.courses.length > 0),
    [timetableData, services]
  );

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dayCourse = weeklyTimetable.find(day => day.date.getTime() === today.getTime())?.courses ?? [];

      if (dayCourse.length === 0) {
        const futureDays = weeklyTimetable
          .filter(day => day.date.getTime() > today.getTime())
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (futureDays.length > 0) {
          dayCourse = futureDays[0].courses;
        }
      }

      dayCourse = dayCourse.filter(course => course.to.getTime() > Date.now());
      setCourses(dayCourse);
    };
    fetchData();
  }, [weeklyTimetable]);

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
      data={courses}
      style={{
        width: '100%',
        paddingHorizontal: 10
      }}
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
}

export default HomeTimeTableWidget;
