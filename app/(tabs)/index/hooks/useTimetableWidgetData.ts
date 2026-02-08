import { useEffect, useMemo, useState } from "react";

import { getWeekNumberFromDate } from "@/database/useHomework";
import { useTimetable } from "@/database/useTimetable";
import { Course as SharedCourse } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";

type TimetableDay = {
  courses: SharedCourse[];
  date: Date;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isCourseNotEnded = (course: SharedCourse, now: Date): boolean => {
  return course.to.getTime() >= now.getTime();
};

const getCoursesForToday = (
  weeklyTimetable: TimetableDay[],
  today: Date,
  now: Date
): SharedCourse[] => {
  return (
    weeklyTimetable
      .find(day => isSameDay(new Date(day.date), today))
      ?.courses.filter(course => isCourseNotEnded(course, now)) ?? []
  );
};

const getNextDayCourses = (
  weeklyTimetable: TimetableDay[],
  today: Date
): SharedCourse[] => {
  const futureDays = weeklyTimetable
    .filter(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate > today;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return futureDays[0]?.courses ?? [];
};

export const useTimetableWidgetData = () => {
  const now = new Date();
  const weekNumber = getWeekNumberFromDate(now);

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(a => a.id === lastUsedAccount);

  const services = useMemo(
    () => account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account?.services]
  );
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  const timetableData = useTimetable(undefined, weekNumber);

  const weeklyTimetable = useMemo(
    () =>
      timetableData
        .map(day => ({
          ...day,
          courses: day.courses.filter(
            course =>
              services.includes(course.createdByAccount) ||
              course.createdByAccount.startsWith("ical_")
          ),
        }))
        .filter(day => day.courses.length > 0),
    [timetableData, services]
  );

  const courses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCourses = getCoursesForToday(weeklyTimetable, today, now);

    return todayCourses.length > 0
      ? todayCourses
      : getNextDayCourses(weeklyTimetable, today);
  }, [weeklyTimetable, now]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return { courses, isLoading };
};
