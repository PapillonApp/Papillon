import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";

import { LEAD_TIME_MS, planCourseActivities } from "./courseLiveActivityPlan";

const at = (hours: number, minutes = 0) => new Date(2026, 9, 5, hours, minutes).getTime();

const course = (id: string, from: number, to: number, status?: CourseStatus) =>
  ({ id, from: new Date(from), to: new Date(to), status }) as unknown as SharedCourse;

const plan = (courses: SharedCourse[], now: number) =>
  planCourseActivities(courses, now).map(({ course, startAt }) => [course.id, startAt]);

test("back-to-back courses each wait for the previous one to end", () => {
  const day = [course("b", at(9), at(10)), course("a", at(8), at(9)), course("c", at(10, 30), at(11, 30))];
  expect(plan(day, at(7))).toEqual([
    ["a", at(8) - LEAD_TIME_MS],
    ["b", at(9)],
    ["c", at(10, 30) - LEAD_TIME_MS],
  ]);
});

test("the ongoing course is due, finished and cancelled ones are left out", () => {
  const day = [
    course("done", at(7), at(8)),
    course("now", at(8), at(9)),
    course("off", at(9), at(10), CourseStatus.CANCELED),
    course("next", at(10), at(11)),
  ];
  expect(plan(day, at(8, 30))).toEqual([
    ["now", at(8) - LEAD_TIME_MS],
    ["next", at(10) - LEAD_TIME_MS],
  ]);
});

test("a course hidden behind an overlapping one is skipped", () => {
  expect(plan([course("long", at(8), at(10)), course("inside", at(9), at(9, 30))], at(7))).toEqual([
    ["long", at(8) - LEAD_TIME_MS],
  ]);
});

test("only the next day and at most five courses are planned", () => {
  const week = Array.from({ length: 8 }, (_, index) => course(`c${index}`, at(8 + index), at(8 + index, 50)));
  expect(plan(week, at(7))).toHaveLength(5);
  expect(plan([course("tomorrow", at(8) + 86_400_000 * 2, at(9) + 86_400_000 * 2)], at(7))).toEqual([]);
});
