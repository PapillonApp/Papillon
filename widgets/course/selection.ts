import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";

/** How long before a course starts its Live Activity shows up. */
export const LIVE_ACTIVITY_LEAD_TIME_MS = 15 * 60 * 1000;

const isEligible = (course: SharedCourse) => course.status !== CourseStatus.CANCELED;

const byStart = (a: SharedCourse, b: SharedCourse) => a.from.getTime() - b.from.getTime();

/**
 * The one course worth a Live Activity: the one being taught right now, or else
 * the next one close enough to be imminent. A course already under way always
 * wins over one about to start.
 */
export const selectLiveActivityCourse = (
  courses: SharedCourse[],
  at: Date
): SharedCourse | null => {
  const now = at.getTime();
  const eligible = courses.filter(isEligible).sort(byStart);

  const ongoing = eligible.find(
    (course) => course.from.getTime() <= now && course.to.getTime() > now
  );

  if (ongoing) {
    return ongoing;
  }

  const imminent = eligible.find(
    (course) =>
      course.from.getTime() > now &&
      course.from.getTime() - now <= LIVE_ACTIVITY_LEAD_TIME_MS
  );

  return imminent ?? null;
};

/**
 * The next moment the selection above would answer something else — a course
 * coming into range, starting, or ending. `null` when nothing is left to wait
 * for.
 */
export const nextLiveActivityTransition = (
  courses: SharedCourse[],
  at: Date
): number | null => {
  const now = at.getTime();

  const moments = courses
    .filter(isEligible)
    .flatMap((course) => [
      course.from.getTime() - LIVE_ACTIVITY_LEAD_TIME_MS,
      course.from.getTime(),
      course.to.getTime()
    ])
    .filter((moment) => moment > now)
    .sort((a, b) => a - b);

  return moments[0] ?? null;
};
