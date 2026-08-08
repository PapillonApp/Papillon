import {
  configure,
  registerHandler,
  type IntentHandler,
} from "papillon-intents";
import config from "../papillon-intents.config";

import { initializeAccountManager } from "@/services/shared";
import { CourseStatus } from "@/services/shared/timetable";
import { useAccountStore } from "@/stores/account";
import { getWeekNumberFromDate } from "@/database/useHomework";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { error } from "@/utils/logger/logger";
import { getSubjectName } from "@/utils/subjects/name";

configure(config.settings ?? {});

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function initManager() {
  if (!useAccountStore.persist.hasHydrated()) {
    await new Promise<void>((resolve) => {
      const unsub = useAccountStore.persist.onFinishHydration(() => {
        unsub();
        resolve();
      });
    });
  }

  const { lastUsedAccount, accounts } = useAccountStore.getState();
  if (!lastUsedAccount || !accounts.find((a) => a.id === lastUsedAccount)) {
    return null;
  }

  return initializeAccountManager(lastUsedAccount);
}

function parseDate(raw: unknown): Date {
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") return new Date(raw);
  if (typeof raw === "string") {
    // DD/MM/YYYY
    const ddmmyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      return new Date(
        Number(ddmmyyyy[3]),
        Number(ddmmyyyy[2]) - 1,
        Number(ddmmyyyy[1]),
      );
    }
    return new Date(raw);
  }
  return new Date();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── Grades ───────────────────────────────────────────────────────────────────

const getLatestGrades: IntentHandler = async () => {
  try {
    const manager = await initManager();
    if (!manager) return null;

    const periods = await manager.getGradesPeriods();
    const currentPeriod = getCurrentPeriod(periods);
    if (!currentPeriod) return null;

    const result = await manager.getGradesForPeriod(
      currentPeriod,
      currentPeriod.createdByAccount,
    );

    const grades = result.subjects
      .flatMap((subject) => subject.grades)
      .filter(
        (grade): grade is NonNullable<typeof grade> =>
          grade != null &&
          grade.studentScore?.value !== undefined &&
          !!grade.givenAt &&
          !isNaN(grade.studentScore.value) &&
          !grade.studentScore.disabled,
      );

    if (grades.length === 0) return null;

    return grades.map((grade) => ({
      id: grade.id,
      subject: getSubjectName(grade.subjectName),
      title: grade.description,
      value: grade.studentScore!.value,
      scale: grade.studentScore!.outOf,
      average: grade.averageScore?.value,
      date: grade.givenAt,
    }));
  } catch (err) {
    error(`Error in getLatestGrades: ${err}`);
    return null;
  }
};

// ─── Timetable ────────────────────────────────────────────────────────────────

async function fetchCoursesForDate(date: Date) {
  const manager = await initManager();
  if (!manager) return null;

  const weekNumber = getWeekNumberFromDate(date);
  const courseDays = await manager.getWeeklyTimetable(weekNumber, date);
  const day = courseDays.find((d) => isSameDay(d.date, date));
  if (!day || day.courses.length === 0) return null;

  return day.courses.map((course) => ({
    id: course.id,
    subject: getSubjectName(course.subject),
    from: course.from,
    to: course.to,
    room: course.room,
    teacher: course.teacher,
    isCanceled: course.status === CourseStatus.CANCELED,
    status:
      course.status !== undefined ? CourseStatus[course.status] : undefined,
  }));
}

const getTodayTimetable: IntentHandler = async () => {
  try {
    return await fetchCoursesForDate(new Date());
  } catch (err) {
    error(`Error in getTodayTimetable: ${err}`);
    return null;
  }
};

const getTimetableForDay: IntentHandler = async (params) => {
  try {
    return await fetchCoursesForDate(parseDate(params.day));
  } catch (err) {
    error(`Error in getTimetableForDay: ${err}`);
    return null;
  }
};

// ─── Homework ─────────────────────────────────────────────────────────────────

async function fetchHomeworkForDate(date: Date) {
  const manager = await initManager();
  if (!manager) return null;

  const weekNumber = getWeekNumberFromDate(date);
  const homeworks = await manager.getHomeworks(weekNumber);
  const filtered = homeworks.filter((hw) => isSameDay(hw.dueDate, date));
  if (filtered.length === 0) return null;

  return filtered.map((hw) => ({
    id: hw.id,
    subject: getSubjectName(hw.subject),
    content: stripHtml(hw.content),
    dueDate: hw.dueDate,
    isDone: hw.isDone,
    evaluation: hw.evaluation,
  }));
}

const getTodayHomework: IntentHandler = async () => {
  try {
    return await fetchHomeworkForDate(new Date());
  } catch (err) {
    error(`Error in getTodayHomework: ${err}`);
    return null;
  }
};

const getHomeworkForDate: IntentHandler = async (params) => {
  try {
    return await fetchHomeworkForDate(parseDate(params.date));
  } catch (err) {
    error(`Error in getHomeworkForDate: ${err}`);
    return null;
  }
};


registerHandler("grades.getLatest", getLatestGrades);
registerHandler("timetable.getToday", getTodayTimetable);
registerHandler("timetable.getForDay", getTimetableForDay);
registerHandler("homework.getToday", getTodayHomework);
registerHandler("homework.getForDate", getHomeworkForDate);
