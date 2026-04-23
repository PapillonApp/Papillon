import { formatDistanceToNowStrict } from "date-fns";
import * as DateLocale from "date-fns/locale";
import { t } from "i18next";
import { useMemo } from "react";

import { Course as SharedCourse } from "@/services/shared/timetable";
import i18n from "@/utils/i18n";

export const useTimetableWidgetTitle = (courses: SharedCourse[]) =>
  useMemo(() => {
    const nextCourse = courses[0];

    if (!nextCourse) {
      return t("Home_Widget_NextCourses");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextCourseDay = new Date(nextCourse.from);
    nextCourseDay.setHours(0, 0, 0, 0);

    if (nextCourseDay.getTime() === today.getTime()) {
      return t("Today");
    }

    if (nextCourseDay.getTime() === tomorrow.getTime()) {
      return t("Tomorrow");
    }

    const distance = formatDistanceToNowStrict(nextCourseDay, {
      addSuffix: true,
      unit: "day",
      locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS
    });

    return distance.charAt(0).toUpperCase() + distance.slice(1);
  }, [courses, i18n.language]);
