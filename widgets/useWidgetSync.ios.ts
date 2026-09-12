import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState, type AppStateStatus } from "react-native";

import {
  useTimetableWidgetData,
  type UpcomingCourseDay
} from "@/app/(tabs)/index/hooks/useTimetableWidgetData";
import { useUpcomingHomework } from "@/app/(tabs)/tasks/hooks/useUpcomingHomework";
import { useSettingsStore } from "@/stores/settings";
import { AppColors } from "@/utils/colors";
import { warn } from "@/utils/logger/logger";
import { useFont } from "@/utils/theme/fonts";

import { CalendarWidget } from "./calendar/CalendarWidget";
import { buildCalendarTimeline } from "./calendar/data";
import { nextLiveActivityTransition } from "./course/selection";
import { syncCourseLiveActivity } from "./course/liveActivity";
import { TasksWidget } from "./tasks/TasksWidget";
import { buildTasksTimeline } from "./tasks/data";
import { buildWidgetTheme, type WidgetFonts } from "./theme";

const useAccentColor = () => {
  const colorSelected = useSettingsStore(
    (state) => state.personalization.colorSelected
  );

  return useMemo(() => {
    const selected =
      colorSelected !== null && colorSelected !== undefined
        ? AppColors.find((color) => color.colorEnum === colorSelected)
        : undefined;

    return (selected ?? AppColors[0]).mainColor;
  }, [colorSelected]);
};

const useWidgetFonts = (): WidgetFonts => {
  const papillonFont = useFont();

  return useMemo(
    () => ({
      regular: papillonFont("regular"),
      medium: papillonFont("medium"),
      semibold: papillonFont("semibold"),
      bold: papillonFont("bold")
    }),
    [papillonFont]
  );
};

/**
 * Bumps a counter every time the app comes back to the foreground, so the
 * widget timelines get rebuilt (with a fresh `new Date()`) on every focus.
 */
const useForegroundTick = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let previous = AppState.currentState;

    const subscription = AppState.addEventListener(
      "change",
      (next: AppStateStatus) => {
        if (previous !== "active" && next === "active") {
          setTick((value) => value + 1);
        }
        previous = next;
      }
    );

    return () => subscription.remove();
  }, []);

  return tick;
};

const push = (name: string, update: () => void) => {
  try {
    update();
  } catch (error) {
    warn(`${name} widget sync failed: ${error}`);
  }
};

/**
 * The longest a transition timer is allowed to run for. Anything further out is
 * re-checked from here rather than waited on in one go — the app is unlikely to
 * still be in the foreground by then anyway.
 */
const MAX_TRANSITION_DELAY_MS = 30 * 60 * 1000;

/**
 * Keeps the course Live Activity in step with the timetable. Live Activities
 * cannot be scheduled ahead of time without a push, so the app starts, updates
 * and ends them itself: on every foreground, whenever the courses change, and
 * at the exact moment the answer changes while it is open — a course coming
 * within a quarter of an hour, starting, or ending.
 */
const useCourseLiveActivity = (days: UpcomingCourseDay[], loading: boolean) => {
  const testMode = useSettingsStore(
    (state) => state.personalization.liveActivityTestMode ?? false
  );
  // Labels and the fonts the layout draws with are resolved by the app, so the
  // content has to be rebuilt when either changes.
  const { i18n } = useTranslation();
  const fontFamily = useSettingsStore((state) => state.personalization.fontFamily);
  const foregroundTick = useForegroundTick();
  const [transitionTick, setTransitionTick] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const courses = useMemo(() => days.flatMap((day) => day.courses), [days]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const at = new Date();
    // Never rejects — it reports its own failures.
    syncCourseLiveActivity(courses, { at, testMode });

    const next = nextLiveActivityTransition(courses, at);
    if (next === null) {
      return;
    }

    // A second of slack, so the clock has passed the moment rather than landed
    // exactly on it.
    const delay = Math.min(next - at.getTime() + 1000, MAX_TRANSITION_DELAY_MS);
    timeout.current = setTimeout(() => setTransitionTick((value) => value + 1), delay);

    return () => clearTimeout(timeout.current);
  }, [courses, loading, testMode, fontFamily, i18n.language, foregroundTick, transitionTick]);
};

/**
 * Keeps the home screen widgets in sync with the app's data. Mounted once at the
 * root, so widgets are refreshed on every launch and whenever the data they
 * display changes while the app is running.
 */
export const useWidgetSync = () => {
  const { upcomingDays, loading } = useTimetableWidgetData({ showCancelled: true });
  const homework = useUpcomingHomework();
  const accentColor = useAccentColor();
  const fonts = useWidgetFonts();
  const theme = useMemo(() => buildWidgetTheme(accentColor), [accentColor]);
  // Widget labels are rendered by the app, so they have to be rebuilt when the
  // user switches language.
  const { i18n } = useTranslation();
  const foregroundTick = useForegroundTick();

  useCourseLiveActivity(upcomingDays, loading);

  useEffect(() => {
    if (loading) {
      return;
    }

    push("Calendar", () =>
      CalendarWidget.updateTimeline(
        buildCalendarTimeline(upcomingDays, new Date(), accentColor, fonts)
      )
    );
  }, [upcomingDays, accentColor, fonts, loading, i18n.language, foregroundTick]);

  useEffect(() => {
    push("Tasks", () =>
      TasksWidget.updateTimeline(
        buildTasksTimeline(homework, new Date(), { theme, fonts })
      )
    );
  }, [homework, theme, fonts, i18n.language, foregroundTick]);
};
