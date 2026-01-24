import { useState, useEffect, useMemo } from "react";
import { useAccountStore } from "@/stores/account";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { useTimetable } from "@/database/useTimetable";
import { Course as SharedCourse } from "@/services/shared/timetable";

export const useTimetableWidgetData = () => {
  const now = new Date();
  const weekNumber = getWeekNumberFromDate(now);

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const services = useMemo(() =>
    account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account?.services]
  );

  const [courses, setCourses] = useState<SharedCourse[]>([]);

  const timetableData = useTimetable(undefined, weekNumber);
  const weeklyTimetable = useMemo(() =>
    timetableData.map(day => ({
      ...day,
      courses: day.courses.filter(course =>
        services.includes(course.createdByAccount) || course.createdByAccount.startsWith('ical_')
      )
    })).filter(day => day.courses.length > 0),
    [timetableData, services]
  );

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dayCourse = weeklyTimetable.find(day => day.date.getTime() === today.getTime())?.courses ?? [];

      if (dayCourse.length === 0) {
        const futureDays = weeklyTimetable
          .filter(day => day.date.getTime() > today.getTime())
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (futureDays.length > 0) {
          dayCourse = futureDays[0].courses;
        }
      }

      dayCourse = dayCourse.filter(course => course.to.getTime() > Date.now());
      setCourses(dayCourse);
    };
    fetchData();
  }, [weeklyTimetable]);

  return { courses };
};
