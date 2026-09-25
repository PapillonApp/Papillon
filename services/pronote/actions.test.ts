import {
  assignmentStatus,
  assignmentsFromWeek,
  discussionMessages,
  discussionSendMessage,
  GradeKind,
  gradesOverview,
  menus,
  news as pawnoteNews,
  notebook,
  parseTimetable,
  TabLocation,
  timetableFromWeek,
  translateToWeekNumber,
  type SessionHandle,
} from "@blockshub/pawnote-lts";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { getDateRangeOfWeek } from "@/database/useHomework";
import type { Chat } from "@/services/shared/chat";
import { ReturnFormat, type Homework } from "@/services/shared/homework";
import { Pronote } from "@/services/pronote";
import { fetchPronoteHomeworks, setPronoteHomeworkAsDone } from "@/services/pronote/homework";
import { fetchPronoteNews } from "@/services/pronote/news";
import { fetchPronoteCanteenMenu } from "@/services/pronote/canteen";
import { fetchPronoteAttendance } from "@/services/pronote/attendance";
import { fetchPronoteGrades } from "@/services/pronote/grades";
import { fetchPronoteChatMessages } from "@/services/pronote/chat";
import { fetchPronoteWeekTimetable } from "@/services/pronote/timetable";

declare global {
  const jest: typeof import("@jest/globals").jest;
}

jest.mock("@blockshub/pawnote-lts", () => ({
  assignmentStatus: jest.fn(),
  assignmentsFromWeek: jest.fn(),
  discussionMessages: jest.fn(),
  discussionSendMessage: jest.fn(),
  discussionRecipients: jest.fn(),
  discussions: jest.fn(),
  EntityKind: { Teacher: 1, Personal: 2 },
  GradeKind: { Grade: 0, NotGraded: 1, Absent: 2, AbsentZero: 3, Exempted: 4, Unfit: 5, Unreturned: 6, UnreturnedZero: 7 },
  gradesOverview: jest.fn(),
  menus: jest.fn(),
  newDiscussion: jest.fn(),
  newDiscussionRecipients: jest.fn(),
  news: jest.fn(),
  notebook: jest.fn(),
  parseTimetable: jest.fn(),
  TabLocation: { Timetable: "timetable", Grades: "grades", Notebook: "notebook", Menus: "menus", Discussions: "discussions", Assignments: "assignments" },
  timetableFromWeek: jest.fn(),
  translateToWeekNumber: jest.fn(),
}));

jest.mock("@/database/useHomework", () => ({
  getDateRangeOfWeek: jest.fn(() => ({ start: new Date("2026-09-21T00:00:00.000Z") })),
}));

jest.mock("@/stores/account", () => ({
  useAccountStore: { getState: jest.fn(() => ({ accounts: [], updateServiceAuthData: jest.fn() })) },
}));

jest.mock("@/utils/logger/logger", () => ({
  error: jest.fn((message: string) => new Error(message)),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
}));

const mockedAssignmentStatus = jest.mocked(assignmentStatus);
const mockedAssignmentsFromWeek = jest.mocked(assignmentsFromWeek);
const mockedPawnoteNews = jest.mocked(pawnoteNews);
const mockedDiscussionMessages = jest.mocked(discussionMessages);
const mockedDiscussionSendMessage = jest.mocked(discussionSendMessage);
const mockedGradesOverview = jest.mocked(gradesOverview);
const mockedMenus = jest.mocked(menus);
const mockedNotebook = jest.mocked(notebook);
const mockedParseTimetable = jest.mocked(parseTimetable);
const mockedTimetableFromWeek = jest.mocked(timetableFromWeek);
const mockedTranslateWeek = jest.mocked(translateToWeekNumber);
const mockedWeekRange = jest.mocked(getDateRangeOfWeek);

describe("PRONOTE actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedWeekRange.mockReturnValue({ start: new Date("2026-09-21T00:00:00.000Z"), end: new Date("2026-09-27T23:59:59.999Z") });
    mockedTranslateWeek.mockReturnValue(5);
  });

  it("maps a mocked PRONOTE homework response into Papillon homework data", async () => {
    mockedAssignmentsFromWeek.mockResolvedValue([{
      id: "assignment-1",
      subject: { name: "Mathématiques" },
      description: "Exercices 1 à 3",
      deadline: new Date("2026-09-25T00:00:00.000Z"),
      done: false,
      return: { kind: 1 },
      attachments: [],
    }] as never);

    const result = await fetchPronoteHomeworks({ instance: { firstMonday: new Date() } } as SessionHandle, "service-1", 5);

    expect(mockedAssignmentsFromWeek).toHaveBeenCalledWith(expect.any(Object), 5);
    expect(result[0]).toMatchObject({
      id: "assignment-1",
      subject: "Mathématiques",
      content: "Exercices 1 à 3",
      returnFormat: ReturnFormat.PAPER,
      isDone: false,
    });
  });

  it("maps a mocked timetable response to a dated course day", async () => {
    const startsAt = new Date("2026-09-25T08:00:00.000Z");
    mockedTimetableFromWeek.mockResolvedValue({ classes: [{
      is: "lesson",
      id: "course-1",
      subject: { name: "Mathématiques" },
      startDate: startsAt,
      endDate: new Date("2026-09-25T09:00:00.000Z"),
      classrooms: ["B12"],
      teacherNames: ["Mme Martin"],
      groupNames: [],
      notes: "Apporter le manuel",
      status: "Cours maintenu",
      test: false,
    }] } as never);
    mockedParseTimetable.mockImplementation(() => undefined as never);

    const result = await fetchPronoteWeekTimetable(
      { instance: { firstMonday: new Date("2026-09-21T00:00:00.000Z") } } as SessionHandle,
      "service-1",
      39,
      startsAt,
    );

    expect(result).toHaveLength(1);
    expect(result[0].courses[0]).toMatchObject({
      id: "course-1",
      subject: "Mathématiques",
      room: "B12",
      teacher: "Mme Martin",
      createdByAccount: "service-1",
    });
    expect(mockedParseTimetable).toHaveBeenCalled();
  });

  it("maps mocked PRONOTE grades to periods, subjects and scores", async () => {
    const period = { id: "period-1", name: "Trimestre 1", start: new Date("2026-09-01"), end: new Date("2026-12-31") };
    const score = (points: number) => ({ kind: GradeKind.Grade, points });
    const session = {
      user: { resources: [{ tabs: new Map([[TabLocation.Grades, { periods: [{ id: "period-1", name: period.name }] }]]) }] },
    } as unknown as SessionHandle;
    mockedGradesOverview.mockResolvedValue({
      overallAverage: score(16),
      classAverage: score(14),
      grades: [{
        id: "grade-1",
        subject: { id: "math", name: "Mathématiques" },
        comment: "Contrôle",
        date: new Date("2026-09-20"),
        isBonus: false,
        isOptional: false,
        outOf: score(20),
        coefficient: 2,
        value: score(18),
        average: score(15),
        min: score(8),
        max: score(19),
      }],
      subjectsAverages: [{
        subject: { id: "math", name: "Mathématiques" },
        student: score(16),
        class_average: score(14),
        max: score(19),
        min: score(8),
        outOf: score(20),
      }],
    } as never);

    const result = await fetchPronoteGrades(session, "service-1", period);

    expect(result.studentOverall.value).toBe(16);
    expect(result.subjects[0].grades[0]).toMatchObject({ id: "grade-1", studentScore: { value: 18 } });
  });

  it("maps mocked PRONOTE absences and lateness", async () => {
    const session = {
      user: { resources: [{ tabs: new Map([[TabLocation.Notebook, { periods: [{ name: "Trimestre 1" }] }]]) }] },
    } as unknown as SessionHandle;
    mockedNotebook.mockResolvedValue({
      absences: [{
        id: "absence-1",
        startDate: new Date("2026-09-21T08:00:00.000Z"),
        endDate: new Date("2026-09-21T09:35:00.000Z"),
        hoursMissed: 1,
        minutesMissed: 35,
        reason: "Rendez-vous",
        justified: true,
      }],
      delays: [{ id: "delay-1", date: new Date("2026-09-22T08:05:00.000Z"), reason: "Transport", justified: false, minutes: 5 }],
      punishments: [],
      observations: [],
    } as never);

    const result = await fetchPronoteAttendance(session, "service-1", "Trimestre 1");

    expect(result.absences[0]).toMatchObject({ id: "absence-1", timeMissed: 95, justified: true });
    expect(result.delays[0]).toMatchObject({ id: "delay-1", duration: 5, createdByAccount: "service-1" });
  });

  it("maps mocked PRONOTE canteen dishes", async () => {
    mockedMenus.mockResolvedValue({ days: [{
      date: new Date("2026-09-25T00:00:00.000Z"),
      lunch: { entry: [{ name: "Soupe", allergens: [] }], main: [{ name: "Gratin", allergens: [] }] },
    }] } as never);

    const result = await fetchPronoteCanteenMenu({} as SessionHandle, "service-1", new Date("2026-09-25T00:00:00.000Z"));

    expect(result[0]).toMatchObject({
      createdByAccount: "service-1",
      lunch: { entry: [{ name: "Soupe" }], main: [{ name: "Gratin" }] },
    });
  });

  it("maps mocked PRONOTE chat messages with sender and attachments", async () => {
    const chat = { ref: { participantsMessageID: "thread-1" } } as Chat;
    const session = { user: { name: "Élève", resources: [{ tabs: new Map([[TabLocation.Discussions, {}]]) }] } } as unknown as SessionHandle;
    mockedDiscussionMessages.mockResolvedValue({ sents: [{
      id: "message-1",
      content: "Bonjour",
      creationDate: new Date("2026-09-24T08:00:00.000Z"),
      author: { name: "Mme Martin", kind: 0 },
      files: [{ kind: 0, name: "Document.pdf", url: "https://example.test/document.pdf" }],
    }] } as never);

    const result = await fetchPronoteChatMessages(session, "service-1", chat);

    expect(result[0]).toMatchObject({
      id: "message-1",
      content: "Bonjour",
      author: "Mme Martin",
      attachments: [{ name: "Document.pdf", createdByAccount: "service-1" }],
    });
  });

  it("maps PRONOTE news acknowledgement and question state", async () => {
    mockedPawnoteNews.mockResolvedValue({ items: [{
      id: "news-1",
      title: "Information",
      creationDate: new Date("2026-09-24T08:00:00.000Z"),
      read: true,
      acknowledged: false,
      question: { id: "question-1" },
      attachments: [],
      content: "Contenu",
      author: "Vie scolaire",
      category: { name: "Général" },
    }] } as never);

    const result = await fetchPronoteNews({} as SessionHandle, "service-1");

    expect(result[0]).toMatchObject({ acknowledged: false, question: true, title: "Information" });
  });

  it("sends an explicit false state when a completed homework is unchecked", async () => {
    mockedAssignmentStatus.mockResolvedValue(undefined);
    const session = {} as SessionHandle;
    const homework = { id: "assignment-1", isDone: true, progress: 1 } as Homework;

    const result = await setPronoteHomeworkAsDone(session, homework, false);

    expect(mockedAssignmentStatus).toHaveBeenCalledWith(session, "assignment-1", false);
    expect(result).toMatchObject({ isDone: false, progress: 0 });
  });

  it("does not report a successful message as an error", async () => {
    mockedDiscussionSendMessage.mockResolvedValue(undefined);
    const session = {
      user: { resources: [{ tabs: new Map([[TabLocation.Discussions, {}]]) }] },
    } as unknown as SessionHandle;
    const chat = { ref: { participantsMessageID: "thread-1" } } as Chat;
    const pronote = new Pronote("service-1");
    pronote.session = session;
    pronote.tokenExpiration = Date.now() + 60_000;

    await expect(pronote.sendMessageInChat(chat, "Bonjour")).resolves.toBeUndefined();
    expect(mockedDiscussionSendMessage).toHaveBeenCalledWith(session, chat.ref, "Bonjour");
  });
});
