import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";

export const LEAD_TIME_MS = 15 * 60 * 1000;

// What the system is asked to start ahead of time (iOS 26+), bounded so a long
// week does not run into ActivityKit's limit on activities per app.
const HORIZON_MS = 24 * 60 * 60 * 1000;
const MAX_PLANNED = 5;

export type PlannedCourse = { course: SharedCourse; startAt: number };

/**
 * One activity per upcoming course, shown `LEAD_TIME_MS` before it starts but
 * never before the previous one is over, so only one course is ever live. The
 * first entry is due (`startAt <= now`) when a course is under way or about to
 * start; it is the only one shown on systems that cannot schedule.
 */
export const planCourseActivities = (courses: SharedCourse[], now: number): PlannedCourse[] => {
  const plan: PlannedCourse[] = [];
  let previousEnd = -Infinity;

  const eligible = courses
    .filter(course => course.status !== CourseStatus.CANCELED && course.to.getTime() > now)
    .sort((a, b) => a.from.getTime() - b.from.getTime());

  for (const course of eligible) {
    const startAt = Math.max(course.from.getTime() - LEAD_TIME_MS, previousEnd);
    previousEnd = Math.max(previousEnd, course.to.getTime());

    // Entirely covered by an overlapping course.
    if (startAt >= course.to.getTime()) continue;
    if (startAt > now + HORIZON_MS || plan.length === MAX_PLANNED) break;

    plan.push({ course, startAt });
  }

  return plan;
};

/** The next moment the plan changes, for the foreground timer. */
export const nextPlanTransition = (courses: SharedCourse[], now: number): number | null =>
  courses
    .filter(course => course.status !== CourseStatus.CANCELED)
    .flatMap(course => [course.from.getTime() - LEAD_TIME_MS, course.from.getTime(), course.to.getTime()])
    .filter(moment => moment > now)
    .sort((a, b) => a - b)[0] ?? null;
