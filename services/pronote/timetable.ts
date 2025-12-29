import {
  parseTimetable, resource,
  SessionHandle,
  TabLocation,
  TimetableClassActivity,
  TimetableClassDetention,
  TimetableClassLesson,
  timetableFromWeek,
  translateToWeekNumber,
} from "pawnote";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { Course, CourseDay, CourseResource, CourseStatus, CourseType } from "@/services/shared/timetable";
import { error } from "@/utils/logger/logger";

export async function fetchPronoteWeekTimetable(
  session: SessionHandle,
  accountId: string,
  weekNumberRaw: number,
  date: Date
): Promise<CourseDay[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteTimetable");
  }

  const weekNumber = translateToWeekNumber(date, session.instance.firstMonday);
  const timetable = await timetableFromWeek(session, weekNumber);

  parseTimetable(session, timetable, {
    withSuperposedCanceledClasses: false,
    withCanceledClasses: true,
    withPlannedClasses: true,
  });

  const mappedCourses = mapCourses(accountId, timetable.classes);
  const dayMap: Record<string, Course[]> = {};

  for (const course of mappedCourses) {
    const dayKey = course.from.toISOString().split("T")[0];
    dayMap[dayKey] = dayMap[dayKey] || [];
    dayMap[dayKey].push(course);
  }

  for (const day in dayMap) {
    dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
  }

  return Object.entries(dayMap).map(([day, courses]) => ({
    date: new Date(day),
    courses
  }));
}

const mapCourses = (
  accountId: string,
  courses: (
    | TimetableClassLesson
    | TimetableClassDetention
    | TimetableClassActivity
  )[]
): Course[] => {
  const courseList: Course[] = [];

  for (const c of courses) {
    const baseCourse = {
      from: c.startDate,
      to: c.endDate,
      backgroundColor: c.backgroundColor,
      additionalInfo: c.notes,
      createdByAccount: accountId
    }
    if (c.is === "lesson") {
      courseList.push({
        subject: c.subject!.name,
        id: c.id,
        type: CourseType.LESSON,
        room: c.classrooms.join(", "),
        teacher: c.teacherNames.join(", "),
        group: c.groupNames.join(", "),
        status: mapCourseStatus(c),
        customStatus: c.status,
        resourceId: c.lessonResourceID,
        ...baseCourse
      });
    } else if (c.is === "detention") {
      courseList.push({
        id: c.id,
        type: CourseType.DETENTION,
        subject: c.title ?? "Detention",
        room: c.classrooms.join(", "),
        ...baseCourse
      });
    } else if (c.is === "activity") {
      courseList.push({
        id: c.id,
        type: CourseType.ACTIVITY,
        subject: c.title,
        ...baseCourse
      });
    }
  }

  return courseList;
};

export async function fetchPronoteCourseResources(
  session: SessionHandle,
  course: Course
): Promise<CourseResource[]> {
  if (!session) {
    error("Session is undefined", "fetchPronoteCourseResources");
  }

  const timetableTab = session.user.resources[0].tabs.get(
    TabLocation.Timetable
  );
  if (!timetableTab) {
    error("Timetable tab not found in session", "fetchPronoteCourseResources");
  }

  if (!course.resourceId) {
    error("Course resource ID is undefined", "fetchPronoteCourseResources");
  }

  const resources = (await resource(session, course.resourceId)).contents;

  return resources.map(r => ({
    title: r.title,
    description: r.description,
    category: r.category,
    attachments: r.files.map(a => ({
      type: a.kind,
      name: a.name,
      url: a.url,
      createdByAccount: session.user.resources[0].id
    }))
  }))
}

const mapCourseStatus = (course: TimetableClassLesson): CourseStatus | undefined => {
  // eslint-disable-next-line default-case
  switch (course.status) {
  case "Cours annulé":
  case "Prof. absent":
  case "Classe absente":
  case "Prof./pers. absent":
  case "Sortie pédagogique":
    return CourseStatus.CANCELED;
  }

  if (course.test) {
    return CourseStatus.EVALUATED;
  }

  return undefined
};