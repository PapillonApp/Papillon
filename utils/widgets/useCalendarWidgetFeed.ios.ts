import * as PapillonKit from "papillonkit";
import { useEffect, useMemo } from "react";

import { useTimetableWidgetData } from "@/app/(tabs)/index/hooks/useTimetableWidgetData";
import { CourseStatus } from "@/services/shared/timetable";
import { warn } from "@/utils/logger/logger";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectName } from "@/utils/subjects/name";

export const useCalendarWidgetFeed = () => {
  const { upcomingDays, loading } = useTimetableWidgetData({ showCancelled: true });

  const events = useMemo(
    () =>
      upcomingDays
        .flatMap(day => day.courses)
        .filter(course => course.createdByAccount.startsWith("ical_"))
        .map(course => ({
          id: course.id,
          subject: getSubjectName(course.subject),
          color: getSubjectColor(course.subject),
          room: course.room || null,
          teacher: course.teacher || null,
          from: course.from.getTime(),
          to: course.to.getTime(),
          canceled: course.status === CourseStatus.CANCELED,
        })),
    [upcomingDays]
  );

  useEffect(() => {
    if (loading) {
      return;
    }
    PapillonKit.widgets.setCalendarFeed(events).catch(error => warn(`Calendar widget feed failed: ${error}`));
  }, [events, loading]);
};
