import { t } from "i18next";

import type { Course as SharedCourse } from "@/services/shared/timetable";
import i18n from "@/utils/i18n";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

import type { WidgetFonts } from "../theme";
import { buildCourseAppearance, type CourseLiveActivityAppearance } from "./appearance";
import { COURSE_LIVE_ACTIVITY_SIZES, type CourseLiveActivitySizes } from "./sizes";

/** Which of the two states the dev trigger should put on screen. */
export type CourseLiveActivityPreviewMode = "upcoming" | "ongoing";

/**
 * Everything the layout draws with. It is serialized to JSON and handed to the
 * widget extension, which can reach nothing else — so what is not in here does
 * not exist as far as the Live Activity is concerned.
 */
export type CourseLiveActivityProps = {
  /** The course this activity stands for, so a sync can tell "same course, new content" from "another course". */
  courseId: string;
  fonts: WidgetFonts;
  appearance: CourseLiveActivityAppearance;
  sizes: CourseLiveActivitySizes;
  emoji: string;
  subject: string;
  detail: string;
  /** Epoch milliseconds — Dates do not survive the JSON trip to the extension. */
  startsAt: number;
  endsAt: number;
  /** When this content was built, used as the lower bound of the countdown to the start. */
  referenceAt: number;
  startTime: string;
  endTime: string;
  endedLabel: string;
  /** "Commence dans" / "Se termine dans" — what the countdown under it runs to. */
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
