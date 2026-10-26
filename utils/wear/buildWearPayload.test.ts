import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/stores/account", () => ({
  useAccountStore: {
    getState: jest.fn(() => ({ accounts: [], lastUsedAccount: "" })),
  },
}));

import { GradeScore, Subject } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { Course, CourseStatus, CourseType } from "@/services/shared/timetable";
import { Services } from "@/stores/account/types";
import { Colors } from "@/utils/colors";

import { ensureWearIncludedInSettingsGradle } from "../../plugins/with-wear-os";
import {
  buildWearCards,
  buildWearSyncPayload,
  stripHtmlForWear,
  SubjectResolver,
  WalletWithCode,
} from "./buildWearPayload";

const mockResolver: SubjectResolver = {
  getName: s => `Pretty ${s}`,
  getColor: () => "#26B290",
  getEmoji: () => "📚",
};

describe("buildWearPayload", () => {
  it("strips HTML tags and entities for watch display", () => {
    const raw =
      "<p>Exercices <b>12 et 14</b><br/>p. 42 &amp; lire &quot;Chapitre 3&quot;&nbsp;!</p>";
    expect(stripHtmlForWear(raw)).toBe(
      'Exercices 12 et 14 p. 42 & lire "Chapitre 3" !'
    );
  });

  it("builds a complete WearSyncPayload from timetable, grades, homework, and cards", () => {
    const courses: Course[] = [
      {
        id: "course-2",
        subject: "PHYSIQUE",
        type: CourseType.LESSON,
        from: new Date(1761472800000),
        to: new Date(1761476400000),
        room: "B204",
        teacher: "M. Curie",
        status: CourseStatus.CANCELED,
        createdByAccount: "acc-1",
      },
      {
        id: "course-1",
        subject: "MATHS",
        type: CourseType.LESSON,
        from: new Date(1761465600000),
        to: new Date(1761469200000),
        room: "A101",
        teacher: "Mme Gauss",
        createdByAccount: "acc-1",
      },
    ];

    const subjects: Subject[] = [
      {
        id: "sub-maths",
        name: "MATHS",
        studentAverage: { value: 16.5 },
        classAverage: { value: 13.2 },
        outOf: { value: 20 },
        grades: [
          {
            id: "grade-1",
            subjectId: "sub-maths",
            subjectName: "MATHS",
            description: "DS Suites",
            givenAt: new Date(1761400000000),
            coefficient: 2,
            outOf: { value: 20 },
            studentScore: { value: 17.5 },
            bonus: false,
            createdByAccount: "acc-1",
          },
        ],
      },
    ];

    const studentOverall: GradeScore = { value: 15.8 };
    const classOverall: GradeScore = { value: 12.9 };

    const homeworks: Homework[] = [
      {
        id: "hw-1",
        subject: "MATHS",
        content: "<p>Faire l&#39;exercice 5</p>",
        dueDate: new Date(1761550000000),
        isDone: false,
        attachments: [],
        evaluation: true,
        custom: false,
        createdByAccount: "acc-1",
      },
    ];

    const wallets: WalletWithCode[] = [
      {
        wallet: {
          amount: 1450,
          currency: "€",
          lunchRemaining: 3,
          lunchPrice: 450,
          label: "Self Lycée",
          createdByAccount: "srv-turbo",
        },
        serviceId: Services.TURBOSELF,
        qrData: "TURBO-QR-12345",
      },
    ];

    const payload = buildWearSyncPayload(
      {
        accountName: "Ethan Martin",
        className: "Terminale A",
        schoolName: "Lycée Papillon",
        colorSelected: Colors.GREEN,
        courses,
        periodName: "Trimestre 1",
        subjects,
        studentOverall,
        classOverall,
        scale: "20",
        homeworks,
        wallets,
        now: 1761460000000,
      },
      mockResolver
    );

    expect(payload.accountName).toBe("Ethan Martin");
    expect(payload.accentColor).toBe("#26B290");
    // Sorted chronologically: course-1 before course-2
    expect(payload.timetable).toHaveLength(2);
    expect(payload.timetable[0].id).toBe("course-1");
    expect(payload.timetable[0].subject).toBe("Pretty MATHS");
    expect(payload.timetable[1].isCanceled).toBe(true);
    expect(payload.timetable[1].statusLabel).toBe("Annulé");

    // Grades summary
    expect(payload.grades.periodName).toBe("Trimestre 1");
    expect(payload.grades.overallAverage).toBe("15.80");
    expect(payload.grades.classAverage).toBe("12.90");
    expect(payload.grades.recentGrades).toHaveLength(1);
    expect(payload.grades.recentGrades[0].score).toBe("17.50");
    expect(payload.grades.recentGrades[0].outOf).toBe("/20");

    // Homework
    expect(payload.homework).toHaveLength(1);
    expect(payload.homework[0].content).toBe("Faire l'exercice 5");
    expect(payload.homework[0].isEvaluation).toBe(true);

    // Canteen card
    expect(payload.cards).toHaveLength(1);
    expect(payload.cards[0].serviceName).toBe("TurboSelf");
    expect(payload.cards[0].amountFormatted).toBe("14.50 €");
    expect(payload.cards[0].lunchRemaining).toBe(3);
    expect(payload.cards[0].qrData).toBe("TURBO-QR-12345");
    expect(payload.cards[0].codeType).toBe("QR");
  });

  it("maps ÉcoleDirecte canteen cards to CODE39 barcode format", () => {
    const cards = buildWearCards([
      {
        wallet: {
          amount: 2500,
          currency: "€",
          lunchRemaining: 5,
          lunchPrice: 500,
          label: "Cantine ED",
          createdByAccount: "srv-ed",
        },
        serviceId: Services.ECOLEDIRECTE,
        qrData: "ED-123456",
      },
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0].serviceName).toBe("ÉcoleDirecte");
    expect(cards[0].codeType).toBe("CODE39");
    expect(cards[0].qrData).toBe("ED-123456");
  });

  it("idempotently appends include ':wear' in settings.gradle", () => {
    const base = "rootProject.name = 'Papillon'\ninclude ':app'\n";
    const updated = ensureWearIncludedInSettingsGradle(base);
    expect(updated).toContain("include ':wear'");
    expect(ensureWearIncludedInSettingsGradle(updated)).toBe(updated);
  });
});
