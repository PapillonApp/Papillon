import * as PapillonKit from "@getpapillon/papillonkit";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

import { useTimetableWidgetData } from "@/app/(tabs)/index/hooks/useTimetableWidgetData";
import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";
import { useSettingsStore } from "@/stores/settings";
import { warn } from "@/utils/logger/logger";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

export type CourseLiveActivityPreviewMode = "upcoming" | "ongoing";

export const COURSE_LIVE_ACTIVITY_SUPPORTED = PapillonKit.features.liveActivities;

const LEAD_TIME_MS = 15 * 60 * 1000;
const MAX_TRANSITION_DELAY_MS = 30 * 60 * 1000;

const isEligible = (course: SharedCourse) => course.status !== CourseStatus.CANCELED;

const selectCourse = (courses: SharedCourse[], now: number): SharedCourse | null => {
  const eligible = courses.filter(isEligible).sort((a, b) => a.from.getTime() - b.from.getTime());
  return (
    eligible.find(course => course.from.getTime() <= now && course.to.getTime() > now) ??
    eligible.find(course => course.from.getTime() > now && course.from.getTime() - now <= LEAD_TIME_MS) ??
    null
  );
};

const nextTransition = (courses: SharedCourse[], now: number): number | null =>
  courses
    .filter(isEligible)
    .flatMap(course => [course.from.getTime() - LEAD_TIME_MS, course.from.getTime(), course.to.getTime()])
    .filter(moment => moment > now)
    .sort((a, b) => a - b)[0] ?? null;

const toActivity = (course: SharedCourse, bounds: { from: Date; to: Date } = course) => ({
  id: course.id,
  subject: getSubjectName(course.subject),
  emoji: getSubjectEmoji(course.subject),
  color: getSubjectColor(course.subject),
  room: course.room || null,
  teacher: course.teacher || null,
  from: bounds.from.getTime(),
  to: bounds.to.getTime(),
});

// Presentations run one at a time: a foreground sync and a transition landing
// together would otherwise both see "nothing running yet" and start an activity.
let pending: Promise<void> = Promise.resolve();

const present = (course: ReturnType<typeof toActivity> | null): Promise<void> => {
  const work = () =>
    course ? PapillonKit.widgets.showCourseActivity(course) : PapillonKit.widgets.endCourseActivities();
  pending = pending.then(work, work);
  return pending;
};

const PREVIEW_ELAPSED_MS = 5 * 60 * 1000;
const PREVIEW_FALLBACK_DURATION_MS = 55 * 60 * 1000;

/** Shows `course` as if it were about to start or under way, for the dev-mode trigger. */
export const previewCourseLiveActivity = (course: SharedCourse, mode: CourseLiveActivityPreviewMode) => {
  const now = Date.now();
  const scheduled = course.to.getTime() - course.from.getTime();
  const duration = scheduled > 0 ? scheduled : PREVIEW_FALLBACK_DURATION_MS;
  const from = new Date(mode === "ongoing" ? now - PREVIEW_ELAPSED_MS : now + LEAD_TIME_MS);

  return present(toActivity(course, { from, to: new Date(from.getTime() + duration) }));
};

export const stopCourseLiveActivity = () =>
  present(null).catch(error => warn(`Course live activity could not be stopped: ${error}`));

const useForegroundTick = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") setTick(value => value + 1);
    });
    return () => subscription.remove();
  }, []);
  return tick;
};

// Live Activities cannot be scheduled ahead without a push, so the app starts,
// updates and ends them itself: on foreground, on data change, and on a timer
// set to the exact moment the selected course changes.
const useSync = () => {
  const { upcomingDays, loading } = useTimetableWidgetData({ showCancelled: true });
  const enabled = useSettingsStore(state => state.personalization.liveActivitiesEnabled ?? true);
  const testMode = useSettingsStore(state => state.personalization.liveActivityTestMode ?? false);
  // The extension reads both from the settings store, but only redraws on update.
  const fontFamily = useSettingsStore(state => state.personalization.fontFamily);
  const { i18n } = useTranslation();
  const foregroundTick = useForegroundTick();
  const [transitionTick, setTransitionTick] = useState(0);

  const courses = useMemo(() => upcomingDays.flatMap(day => day.courses), [upcomingDays]);

  useEffect(() => {
    // In test mode the course sheet's trigger owns the activity.
    if (loading || testMode) {
      return;
    }

    const now = Date.now();
    const course = enabled ? selectCourse(courses, now) : null;
    present(course && toActivity(course)).catch(error => warn(`Course live activity sync failed: ${error}`));

    const next = enabled ? nextTransition(courses, now) : null;
    if (next === null) {
      return;
    }

    const timeout = setTimeout(
      () => setTransitionTick(value => value + 1),
      Math.min(next - now + 1000, MAX_TRANSITION_DELAY_MS)
    );
    return () => clearTimeout(timeout);
  }, [courses, loading, enabled, testMode, fontFamily, i18n.language, foregroundTick, transitionTick]);
};

export const useCourseLiveActivity = COURSE_LIVE_ACTIVITY_SUPPORTED ? useSync : () => {};
