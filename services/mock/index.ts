import { Attendance } from "@/services/shared/attendance";
import { Period, PeriodGrades } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import { CourseDay } from "@/services/shared/timetable";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";

import {
  generateMockAttendance,
  generateMockGrades,
  generateMockHomeworks,
  generateMockNews,
  generateMockPeriods,
  generateMockTimetable,
} from "./data";

export class MockData implements SchoolServicePlugin {
  displayName = "Mock Data";
  service = Services.MOCK_DATA;
  requiresInternet = false;
  capabilities = [
    Capabilities.HOMEWORK,
    Capabilities.NEWS,
    Capabilities.GRADES,
    Capabilities.ATTENDANCE,
    Capabilities.ATTENDANCE_PERIODS,
    Capabilities.TIMETABLE,
  ];
  authData: Auth = {};
  session = undefined;

  private homeworkState = new Map<string, boolean>();
  private newsState = new Map<string, boolean>();

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<MockData> {
    this.authData = credentials;
    return this;
  }

  async getWeeklyTimetable(
    weekNumber: number,
    date: Date
  ): Promise<CourseDay[]> {
    return generateMockTimetable(this.accountId, weekNumber, date);
  }

  async getHomeworks(weekNumber: number): Promise<Homework[]> {
    return generateMockHomeworks(this.accountId, weekNumber).map(homework => ({
      ...homework,
      isDone: this.homeworkState.get(homework.id) ?? homework.isDone,
    }));
  }

  async setHomeworkCompletion(
    homework: Homework,
    state = !homework.isDone
  ): Promise<Homework> {
    this.homeworkState.set(homework.id, state);
    return { ...homework, isDone: state };
  }

  async getNews(): Promise<News[]> {
    return generateMockNews(this.accountId).map(news => ({
      ...news,
      acknowledged: this.newsState.get(news.id) ?? news.acknowledged,
    }));
  }

  async setNewsAsAcknowledged(news: News): Promise<News> {
    this.newsState.set(news.id, true);
    return { ...news, acknowledged: true };
  }

  async getGradesPeriods(): Promise<Period[]> {
    return generateMockPeriods(this.accountId);
  }

  async getGradesForPeriod(period: Period): Promise<PeriodGrades> {
    return generateMockGrades(this.accountId, period);
  }

  async getAttendancePeriods(): Promise<Period[]> {
    return generateMockPeriods(this.accountId);
  }

  async getAttendanceForPeriod(_period: string): Promise<Attendance> {
    return generateMockAttendance(this.accountId);
  }
}
