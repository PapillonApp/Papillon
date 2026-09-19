import { t } from "i18next";

import type { Course as SharedCourse } from "@/services/shared/timetable";
import i18n from "@/utils/i18n";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

import type { WidgetFonts } from "../theme";
import { buildCourseAppearance, type CourseLiveActivityAppearance } from "./appearance";
import { COURSE_LIVE_ACTIVITY_SIZES, type CourseLiveActivitySizes } from "./sizes";

export type CourseLiveActivityPreviewMode = "upcoming" | "ongoing";

export type CourseLiveActivityProps = {
  courseId: string;
  fonts: WidgetFonts;
  appearance: CourseLiveActivityAppearance;
  sizes: CourseLiveActivitySizes;
  emoji: string;
  subject: string;
  detail: string;
  startsAt: number;
  endsAt: number;
  referenceAt: number;
  startTime: string;
  endTime: string;
  endedLabel: string;
  startingLabel: string;
  endingLabel: string;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });

export const buildCourseLiveActivityProps = (
  course: SharedCourse,
  fonts: WidgetFonts,
  at: Date,
  bounds: { from: Date; to: Date } = { from: course.from, to: course.to }
): CourseLiveActivityProps => ({
  courseId: course.id,
  fonts,
  appearance: buildCourseAppearance(getSubjectColor(course.subject)),
  sizes: COURSE_LIVE_ACTIVITY_SIZES,
  emoji: getSubjectEmoji(course.subject),
  subject: getSubjectName(course.subject),
  detail: [course.room, course.teacher].filter(Boolean).join(" · "),
  startsAt: bounds.from.getTime(),
  endsAt: bounds.to.getTime(),
  referenceAt: at.getTime(),
  startTime: formatTime(bounds.from),
  endTime: formatTime(bounds.to),
  endedLabel: t("Course_LiveActivity_Ended"),
  startingLabel: t("Course_LiveActivity_Starting"),
  endingLabel: t("Course_LiveActivity_Ending")
});
