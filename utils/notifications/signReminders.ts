import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { t } from "i18next";

import { getCourseRouteId } from "@/database/useTimetable";
import { Course } from "@/services/shared/timetable";
import { warn } from "@/utils/logger/logger";

const IDENTIFIER_PREFIX = "sign-reminder-";

// iOS caps pending local notifications at 64, so only look a few days ahead.
const LOOKAHEAD_MS = 3 * 24 * 60 * 60 * 1000;

function getIdentifier(course: Course): string {
  return IDENTIFIER_PREFIX + (course.externalId ?? course.id);
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Schedules a notification at the end of every upcoming course that still
 * needs a signature, and cancels the reminder of courses that no longer do.
 */
export async function syncSignReminders(courses: Course[]): Promise<void> {
  try {
    const now = Date.now();
    const toSchedule = courses.filter(
      course =>
        course.canSign &&
        course.to.getTime() > now &&
        course.to.getTime() < now + LOOKAHEAD_MS
    );
    const toSchedulePending = new Set(toSchedule.map(getIdentifier));

    await Promise.all(
      courses
        .filter(course => !toSchedulePending.has(getIdentifier(course)))
        .map(course =>
          Notifications.cancelScheduledNotificationAsync(getIdentifier(course))
        )
    );

    if (toSchedule.length === 0 || !(await ensurePermission())) return;

    await Promise.all(
      toSchedule.map(course =>
        Notifications.scheduleNotificationAsync({
          identifier: getIdentifier(course),
          content: {
            title: t("Sign_Reminder_Title"),
            body: t("Sign_Reminder_Body", { subject: course.subject }),
            data: { courseRouteId: getCourseRouteId(course) },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: course.to,
          },
        })
      )
    );
  } catch (e) {
    warn(`Failed to sync sign reminders: ${e}`, "syncSignReminders");
  }
}

export async function cancelSignReminder(course: Course): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(getIdentifier(course));
  } catch (e) {
    warn(`Failed to cancel sign reminder: ${e}`, "cancelSignReminder");
  }
}

function openCourseFromResponse(response: Notifications.NotificationResponse) {
  const courseRouteId = response.notification.request.content.data
    ?.courseRouteId as string | undefined;
  if (!courseRouteId) return;
  router.push({
    pathname: "/(modals)/course/[id]",
    params: { id: courseRouteId },
  });
}

/**
 * Shows reminders while the app is in the foreground and opens the course
 * when a reminder is tapped. Returns a cleanup function.
 */
export function setupSignReminderHandlers(): () => void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const lastResponse = Notifications.getLastNotificationResponse();
  if (lastResponse) openCourseFromResponse(lastResponse);

  const subscription = Notifications.addNotificationResponseReceivedListener(
    openCourseFromResponse
  );
  return () => subscription.remove();
}
