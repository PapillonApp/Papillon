import { useState, useEffect, useMemo } from "react";
import { useAccountStore } from "@/stores/account";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { useTimetable } from "@/database/useTimetable";
import { Course as SharedCourse } from "@/services/shared/timetable";

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

  const [courses, setCourses] = useState<SharedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dayCourse =
        weeklyTimetable.find(day => {
          const dayDate = new Date(day.date);

          return (
            dayDate.getFullYear() === today.getFullYear() &&
            dayDate.getMonth() === today.getMonth() &&
            dayDate.getDate() === today.getDate()
          );
        })?.courses ?? [];

      if (dayCourse.length === 0) {
        const futureDays = weeklyTimetable
          .filter(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate > today;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (futureDays.length > 0) {
          dayCourse = futureDays[0].courses;
        }
      }

      setCourses(dayCourse);

      setIsLoading(false);
    };

    fetchData();
  }, [weeklyTimetable]);

  return { courses, isLoading };
};
