import { ObservationType } from "@/services/shared/attendance";
import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";

import { MockData } from "./index";
import {
  generateMockAttendance,
  generateMockGrades,
  generateMockHomeworks,
  generateMockNews,
  generateMockPeriods,
  generateMockTimetable,
} from "./data";

describe("Mock Data generators", () => {
  const accountId = "mock-service-id";
  const referenceDate = new Date(2026, 7, 8, 12);

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(referenceDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("generates a deterministic timetable for every weekday", () => {
    const first = generateMockTimetable(accountId, 32, referenceDate);
    const second = generateMockTimetable(accountId, 32, referenceDate);

    expect(first).toEqual(second);
    expect(first).toHaveLength(5);
    expect(first.map(day => day.date.getDay())).toEqual([1, 2, 3, 4, 5]);
    expect(first.every(day => day.courses.length === 5)).toBe(true);
    expect(
      first
        .flatMap(day => day.courses)
        .every(course => course.createdByAccount === accountId)
    ).toBe(true);
  });

  it("generates one French homework for every weekday", () => {
    const homeworks = generateMockHomeworks(accountId, 32, 2026);

    expect(homeworks).toHaveLength(5);
    expect(homeworks.map(homework => homework.dueDate.getDay())).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(
      homeworks.every(homework => homework.content.startsWith("<p>"))
    ).toBe(true);
    expect(new Set(homeworks.map(homework => homework.id)).size).toBe(5);
  });

  it("provides three periods with complete grade data", () => {
    const periods = generateMockPeriods(accountId, referenceDate);
    const grades = generateMockGrades(accountId, periods[0]);

    expect(periods.map(period => period.name)).toEqual([
      "Trimestre 1",
      "Trimestre 2",
      "Trimestre 3",
    ]);
    expect(grades.subjects.length).toBeGreaterThanOrEqual(6);
    expect(grades.subjects.every(subject => subject.grades?.length === 3)).toBe(
      true
    );
    expect(
      grades.subjects
        .flatMap(subject => subject.grades ?? [])
        .every(grade => grade.createdByAccount === accountId)
    ).toBe(true);
  });

  it("provides French news and all school-life categories", () => {
    const news = generateMockNews(accountId, referenceDate);
    const attendance = generateMockAttendance(accountId, referenceDate);

    expect(news).toHaveLength(4);
    expect(news.some(item => item.author.includes("direction"))).toBe(true);
    expect(attendance.delays).toHaveLength(1);
    expect(attendance.absences).toHaveLength(1);
    expect(attendance.punishments).toHaveLength(1);
    expect(attendance.observations.map(item => item.sectionType)).toEqual(
      expect.arrayContaining([
        ObservationType.Observation,
        ObservationType.Encouragement,
      ])
    );
  });

  it("is offline-capable and keeps interaction state", async () => {
    const plugin = new MockData(accountId);
    expect(plugin.requiresInternet).toBe(false);

    const homework = (await plugin.getHomeworks(32))[0];
    await plugin.setHomeworkCompletion(homework, !homework.isDone);
    expect((await plugin.getHomeworks(32))[0].isDone).toBe(!homework.isDone);

    const news = (await plugin.getNews())[0];
    await plugin.setNewsAsAcknowledged(news);
    expect((await plugin.getNews())[0].acknowledged).toBe(true);
  });
});
