import { format, startOfDay } from "date-fns";
import type { WidgetTimelineEntry } from "expo-widgets";
import { t } from "i18next";

import type { UpcomingCourseDay } from "@/app/(tabs)/index/hooks/useTimetableWidgetData";
import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";
import i18n from "@/utils/i18n";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectName } from "@/utils/subjects/name";

import { formatRelativeDayLabel } from "../dates";
import { buildWidgetTheme, type WidgetFonts, type WidgetTheme } from "../theme";

/** Enough events for the large family, which shows the most of them. */
const MAX_EVENTS = 6;

const MAX_TIMELINE_ENTRIES = 24;

export type CalendarWidgetEvent = {
  id: string;
  subject: string;
  detail: string;
  timeRange: string;
  color: string;
  canceled: boolean;
};

export type CalendarWidgetProps = {
  fonts: WidgetFonts;
  dayLabel: string;
  dayNumber: string;
  accentColor: string;
  /** Tinted from the first upcoming course's color, for the compact background. */
  theme: WidgetTheme;
  emptyLabel: string;
  events: CalendarWidgetEvent[];
};

type ScheduledEvent = {
  event: CalendarWidgetEvent;
  to: number;
  day: number;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });

const toEvent = (course: SharedCourse): CalendarWidgetEvent => ({
  id: course.id,
  subject: getSubjectName(course.subject),
  detail: [course.room, course.teacher].filter(Boolean).join(" · "),
  timeRange: `${formatTime(course.from)} – ${formatTime(course.to)}`,
  color: getSubjectColor(course.subject),
  canceled: course.status === CourseStatus.CANCELED
});

const buildProps = (
  scheduled: ScheduledEvent[],
  at: number,
  accentColor: string,
  fonts: WidgetFonts
): CalendarWidgetProps => {
  const upcoming = scheduled.filter((item) => item.to > at);
  const day = upcoming.length > 0 ? upcoming[0].day : startOfDay(new Date(at)).getTime();
  const dayDate = new Date(day);
  const events = upcoming
    .filter((item) => item.day === day)
    .slice(0, MAX_EVENTS)
    .map((item) => item.event);

  return {
    fonts,
    dayLabel: formatRelativeDayLabel(dayDate, new Date(at)),
    dayNumber: format(dayDate, "d"),
    accentColor,
    theme: buildWidgetTheme(events[0]?.color ?? accentColor),
    emptyLabel: t("Home_Widget_NoCourses"),
    events
  };
};

/**
 * Turns the upcoming days into the entries WidgetKit will walk through on its
 * own. The rendered content only changes when a course ends (it drops off the
 * list) or when the day rolls over (the "Aujourd'hui"/"Demain" label moves), so
 * those two moments are the only ones worth an entry.
 */
export const buildCalendarTimeline = (
  days: UpcomingCourseDay[],
  from: Date,
  accentColor: string,
  fonts: WidgetFonts
): WidgetTimelineEntry<CalendarWidgetProps>[] => {
  const scheduled: ScheduledEvent[] = days
    .flatMap((day) => day.courses)
    .sort((a, b) => a.from.getTime() - b.from.getTime())
    .map((course) => ({
      event: toEvent(course),
      to: course.to.getTime(),
      day: startOfDay(course.from).getTime()
    }));

  const moments = new Set<number>([from.getTime()]);
  for (const item of scheduled) {
    moments.add(item.to);
    moments.add(item.day);
  }

  return [...moments]
    .filter((moment) => moment >= from.getTime())
    .sort((a, b) => a - b)
    .slice(0, MAX_TIMELINE_ENTRIES)
    .map((moment) => ({
      date: new Date(moment),
      props: buildProps(scheduled, moment, accentColor, fonts)
    }));
};
