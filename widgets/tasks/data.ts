import { startOfDay } from "date-fns";
import type { WidgetTimelineEntry } from "expo-widgets";
import { t } from "i18next";

import type { UpcomingHomework } from "@/app/(tabs)/tasks/hooks/useUpcomingHomework";
import { Homework } from "@/services/shared/homework";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

import { formatRelativeDayLabel } from "../dates";
import type { WidgetFonts, WidgetTheme } from "../theme";

/** Enough tasks for the large family, which shows the most of them. */
const MAX_TASKS = 5;

const MAX_TIMELINE_ENTRIES = 14;

const MAX_DESCRIPTION_LENGTH = 120;

export type TasksWidgetTask = {
  id: string;
  subject: string;
  emoji: string;
  description: string;
  /** Relative day this is due, e.g. "Tue 14" or "Tomorrow". */
  dayLabel: string;
};

export type TasksWidgetStyle = {
  theme: WidgetTheme;
  fonts: WidgetFonts;
};

export type TasksWidgetProps = {
  theme: WidgetTheme;
  fonts: WidgetFonts;
  countLabel: string;
  title: string;
  subtitle: string;
  /** Share of this week's homework already done, for the ring. */
  progress: number;
  emptyLabel: string;
  tasks: TasksWidgetTask[];
};

type ScheduledTask = {
  task: TasksWidgetTask;
  dueDate: Date;
  day: number;
};

const capitalize = (value: string) =>
  value.charAt(0).toLocaleUpperCase() + value.slice(1);

const toDescription = (content: string) => {
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}…`
    : text;
};

const toTask = (homework: Homework): TasksWidgetTask => ({
  id: homework.id,
  subject: getSubjectName(homework.subject),
  emoji: getSubjectEmoji(homework.subject),
  description: toDescription(homework.content),
  dayLabel: ""
});

// The list runs across days rather than stopping at the first one — a day with
// a single piece of homework would otherwise leave the widget near-empty. Each
// task carries its own day so the layout can head each group. The count beside
// it stays the week's, the way the tasks screen summarises it.
const buildProps = (
  scheduled: ScheduledTask[],
  weekRemaining: number,
  progress: number,
  at: number,
  style: TasksWidgetStyle
): TasksWidgetProps => {
  const now = new Date(at);
  const pending = scheduled.filter((item) => item.day >= startOfDay(now).getTime());

  return {
    theme: style.theme,
    fonts: style.fonts,
    countLabel: String(weekRemaining),
    title: capitalize(t("Tasks_LeftHomeworks_Title")),
    subtitle: capitalize(t("Tasks_LeftHomeworks_Time")),
    progress,
    emptyLabel: t("Tasks_Nav_Completed"),
    tasks: pending.slice(0, MAX_TASKS).map((item) => ({
      ...item.task,
      // Bare day, no "for" prefix: it sits at the end of the subject row where
      // the preposition would only take width from the subject.
      dayLabel: capitalize(formatRelativeDayLabel(new Date(item.day), now, "EEE d"))
    }))
  };
};

/**
 * Task content only moves when the day rolls over: the day labels shift and
 * anything left from the previous day drops off. One entry per upcoming due day
 * is therefore all WidgetKit needs.
 */
export const buildTasksTimeline = (
  { upcoming, weekDone, weekTotal }: UpcomingHomework,
  from: Date,
  style: TasksWidgetStyle
): WidgetTimelineEntry<TasksWidgetProps>[] => {
  const scheduled: ScheduledTask[] = upcoming
    .slice()
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .map((item) => ({
      task: toTask(item),
      dueDate: item.dueDate,
      day: startOfDay(item.dueDate).getTime()
    }));

  const progress = weekTotal > 0 ? weekDone / weekTotal : 0;

  const moments = new Set<number>([from.getTime()]);
  for (const item of scheduled) {
    moments.add(item.day);
  }

  return [...moments]
    .filter((moment) => moment >= from.getTime())
    .sort((a, b) => a - b)
    .slice(0, MAX_TIMELINE_ENTRIES)
    .map((moment) => ({
      date: new Date(moment),
      props: buildProps(scheduled, weekTotal - weekDone, progress, moment, style)
    }));
};
