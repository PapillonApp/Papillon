import { useState, useEffect, useMemo } from "react";
import { MMKV } from "react-native-mmkv";
import { useAccountStore } from "@/stores/account";
import { useTimetable } from "@/database/useTimetable";
import { Course as SharedCourse } from "@/services/shared/timetable";

const widgetCacheStorage = new MMKV({ id: "home-widget-cache" });

type CachedCourse = Omit<SharedCourse, "from" | "to"> & {
  from: number;
  to: number;
};

type TimetableWidgetCache = {
  fetchedAt: number;
  courses: CachedCourse[];
};

const serializeCourse = (course: SharedCourse): CachedCourse => ({
  ...course,
  from: course.from.getTime(),
  to: course.to.getTime()
});

const deserializeCourse = (course: CachedCourse): SharedCourse => ({
  ...course,
  from: new Date(course.from),
  to: new Date(course.to)
});

export const useTimetableWidgetData = () => {
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);
  const cacheKey = useMemo(
    () => (account?.id ? `widget:timetable:${account.id}` : undefined),
    [account?.id]
  );

  const services = useMemo(() =>
    account?.services?.map((service: { id: string }) => service.id) ?? [],
    [account?.services]
  );

  const [courses, setCourses] = useState<SharedCourse[]>([]);

  const currentYear = now.getFullYear();
  const currentYearWeeks = useMemo(
    () => Array.from({ length: 54 }, (_, index) => index + 1),
    []
  );
  const nextYearWeeks = useMemo(
    () => Array.from({ length: 54 }, (_, index) => index + 1),
    []
  );
  const nextYearDate = useMemo(() => new Date(currentYear + 1, 0, 1), [currentYear]);

  const currentYearTimetable = useTimetable(undefined, currentYearWeeks, now);
  const nextYearTimetable = useTimetable(undefined, nextYearWeeks, nextYearDate);

  const weeklyTimetable = useMemo(() =>
    [...currentYearTimetable, ...nextYearTimetable]
      .map(day => ({
        ...day,
        courses: day.courses.filter(course =>
        services.includes(course.createdByAccount) || course.createdByAccount.startsWith('ical_')
      )
      }))
      .filter(day => day.courses.length > 0),
    [currentYearTimetable, nextYearTimetable, services]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!cacheKey) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const cachedRaw = widgetCacheStorage.getString(cacheKey);
    if (!cachedRaw) {
      setLoading(false);
      return;
    }

    try {
      const cached = JSON.parse(cachedRaw) as TimetableWidgetCache;
      const hydrated = cached.courses
        .map(deserializeCourse)
        .filter((course) => course.to.getTime() > Date.now())
        .sort((a, b) => a.from.getTime() - b.from.getTime());
      setCourses(hydrated);
    } catch {
      widgetCacheStorage.delete(cacheKey);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    setLoading(true);
    if (weeklyTimetable.length === 0) {
      setLoading(false);
      return;
    }

    const nowTimestamp = now.getTime();
    const daysWithFutureCourses = weeklyTimetable
      .map((day) => ({
        date: day.date,
        courses: day.courses
          .filter((course) => course.to.getTime() > nowTimestamp)
          .sort((a, b) => a.from.getTime() - b.from.getTime())
      }))
      .filter((day) => day.courses.length > 0)
      .sort((a, b) => a.courses[0].from.getTime() - b.courses[0].from.getTime());

    const nextCourses = daysWithFutureCourses[0]?.courses ?? [];
    setCourses(nextCourses);
    if (cacheKey) {
      const payload: TimetableWidgetCache = {
        fetchedAt: Date.now(),
        courses: nextCourses.map(serializeCourse)
      };
      widgetCacheStorage.set(cacheKey, JSON.stringify(payload));
    }
    setLoading(false);
  }, [weeklyTimetable, now, cacheKey]);

  return { courses, loading };
};
