import { Attendance, ObservationType } from "@/services/shared/attendance";
import { Period, PeriodGrades, Subject } from "@/services/shared/grade";
import { Homework, ReturnFormat } from "@/services/shared/homework";
import { News } from "@/services/shared/news";
import {
  CourseDay,
  CourseStatus,
  CourseType,
} from "@/services/shared/timetable";

type LessonTemplate = {
  subject: string;
  teacher: string;
  room: string;
  color: string;
};

const LESSONS: LessonTemplate[] = [
  {
    subject: "Mathématiques",
    teacher: "Mme Lefèvre",
    room: "B 204",
    color: "#3568D4",
  },
  {
    subject: "Français",
    teacher: "M. Dubois",
    room: "A 112",
    color: "#D94B64",
  },
  {
    subject: "Histoire-Géographie",
    teacher: "Mme Bernard",
    room: "C 018",
    color: "#E29035",
  },
  {
    subject: "Anglais",
    teacher: "Mme Martin",
    room: "B 106",
    color: "#8E5AC7",
  },
  {
    subject: "Physique-Chimie",
    teacher: "M. Robert",
    room: "Labo 2",
    color: "#24A17A",
  },
  {
    subject: "Sciences de la vie et de la Terre",
    teacher: "Mme Moreau",
    room: "Labo 4",
    color: "#4A9B4F",
  },
  {
    subject: "Sciences économiques et sociales",
    teacher: "M. Petit",
    room: "C 202",
    color: "#B4772D",
  },
  {
    subject: "Éducation physique et sportive",
    teacher: "Mme Roux",
    room: "Gymnase",
    color: "#E05D34",
  },
];

const HOMEWORK_CONTENT = [
  [
    "Mathématiques",
    "<p>Faire les exercices 42 à 47 page 128. Détailler les calculs dans le cahier.</p>",
  ],
  [
    "Français",
    "<p>Lire les chapitres 6 et 7 de <em>Germinal</em> et préparer trois citations commentées.</p>",
  ],
  [
    "Histoire-Géographie",
    "<p>Réviser le chapitre sur la Révolution française et compléter la frise chronologique.</p>",
  ],
  [
    "Anglais",
    "<p>Apprendre le vocabulaire de la séquence « Living in London » et préparer l'expression orale.</p>",
  ],
  [
    "Physique-Chimie",
    "<p>Rédiger le compte rendu du TP sur la réfraction de la lumière.</p>",
  ],
  [
    "Sciences de la vie et de la Terre",
    "<p>Terminer le schéma légendé de la cellule et revoir la fiche méthode.</p>",
  ],
] as const;

const atTime = (day: Date, hours: number, minutes = 0): Date => {
  const result = new Date(day);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDateRangeOfWeek = (weekNumber: number, year: number) => {
  const janFirst = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7;
  const weekStart = new Date(janFirst.setDate(janFirst.getDate() + daysOffset));
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day <= 4 ? 1 : 8);
  const start = new Date(weekStart.setDate(diff));
  const end = addDays(start, 6);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export function generateMockTimetable(
  accountId: string,
  weekNumber: number,
  referenceDate: Date
): CourseDay[] {
  const { start } = getDateRangeOfWeek(weekNumber, referenceDate.getFullYear());
  const slots = [
    [8, 0, 9, 0],
    [9, 10, 10, 10],
    [10, 25, 11, 25],
    [13, 30, 14, 30],
    [14, 40, 15, 40],
  ];

  return Array.from({ length: 5 }, (_, dayIndex) => {
    const date = addDays(start, dayIndex);
    const courses = slots.map(
      ([fromHour, fromMinute, toHour, toMinute], slotIndex) => {
        const lessonIndex =
          (dayIndex * 3 + slotIndex * 2 + weekNumber) % LESSONS.length;
        const lesson = LESSONS[lessonIndex];
        const from = atTime(date, fromHour, fromMinute);
        const to = atTime(date, toHour, toMinute);
        const isEvaluated = dayIndex === 1 && slotIndex === 1;
        const isEdited = dayIndex === 3 && slotIndex === 3;
        const isCanceled = dayIndex === 4 && slotIndex === 4;

        return {
          id: `mock-course-${referenceDate.getFullYear()}-${weekNumber}-${dayIndex}-${slotIndex}`,
          subject: lesson.subject,
          teacher: lesson.teacher,
          room: lesson.room,
          backgroundColor: lesson.color,
          group: slotIndex % 3 === 0 ? "Seconde 2" : undefined,
          additionalInfo: isEvaluated ? "Évaluation prévue" : undefined,
          status: isEvaluated
            ? CourseStatus.EVALUATED
            : isEdited
              ? CourseStatus.EDITED
              : isCanceled
                ? CourseStatus.CANCELED
                : undefined,
          type: CourseType.LESSON,
          from,
          to,
          createdByAccount: accountId,
        };
      }
    );

    return { date: atTime(date, 0), courses };
  });
}

export function generateMockHomeworks(
  accountId: string,
  weekNumber: number,
  year = new Date().getFullYear()
): Homework[] {
  const { start } = getDateRangeOfWeek(weekNumber, year);

  return Array.from({ length: 5 }, (_, dayIndex) => {
    const [subject, content] =
      HOMEWORK_CONTENT[(weekNumber + dayIndex) % HOMEWORK_CONTENT.length];
    const dueDate = atTime(addDays(start, dayIndex), 8);
    return {
      id: `mock-homework-${year}-${weekNumber}-${dayIndex}`,
      subject,
      content,
      dueDate,
      isDone: dayIndex === 0,
      returnFormat:
        dayIndex === 4 ? ReturnFormat.FILE_UPLOAD : ReturnFormat.PAPER,
      attachments: [],
      evaluation: dayIndex === 1 || dayIndex === 3,
      custom: false,
      progress: dayIndex === 2 ? 55 : undefined,
      createdByAccount: accountId,
    };
  });
}

export function getMockSchoolYear(referenceDate = new Date()): number {
  return referenceDate.getMonth() >= 7
    ? referenceDate.getFullYear()
    : referenceDate.getFullYear() - 1;
}

export function generateMockPeriods(
  accountId: string,
  referenceDate = new Date()
): Period[] {
  const year = getMockSchoolYear(referenceDate);
  return [
    {
      id: `mock-period-${year}-1`,
      name: "Trimestre 1",
      start: new Date(year, 8, 2),
      end: new Date(year, 11, 20, 23, 59),
      createdByAccount: accountId,
    },
    {
      id: `mock-period-${year}-2`,
      name: "Trimestre 2",
      start: new Date(year + 1, 0, 6),
      end: new Date(year + 1, 2, 28, 23, 59),
      createdByAccount: accountId,
    },
    {
      id: `mock-period-${year}-3`,
      name: "Trimestre 3",
      start: new Date(year + 1, 2, 31),
      end: new Date(year + 1, 6, 4, 23, 59),
      createdByAccount: accountId,
    },
  ];
}

const GRADE_SUBJECTS = [
  ["Mathématiques", 15.5, 13.2],
  ["Français", 14, 12.8],
  ["Histoire-Géographie", 16, 13.7],
  ["Anglais", 17.5, 14.1],
  ["Physique-Chimie", 13.5, 12.4],
  ["Sciences de la vie et de la Terre", 15, 13.5],
] as const;

export function generateMockGrades(
  accountId: string,
  period: Period
): PeriodGrades {
  const periodIndex = Number(period.name.slice(-1)) || 1;
  const subjects: Subject[] = GRADE_SUBJECTS.map(
    ([name, studentAverage, classAverage], subjectIndex) => {
      const subjectId = `mock-subject-${subjectIndex}`;
      const adjustedAverage = studentAverage - (periodIndex - 1) * 0.3;
      return {
        id: subjectId,
        name,
        studentAverage: { value: adjustedAverage, outOf: 20 },
        classAverage: { value: classAverage, outOf: 20 },
        maximum: { value: 19, outOf: 20 },
        minimum: { value: 7.5, outOf: 20 },
        outOf: { value: 20 },
        grades: (subjectIndex % 2 === 0 ? [0, 1] : [0, 1, 2]).map(gradeIndex => ({
          id: `mock-grade-${periodIndex}-${subjectIndex}-${gradeIndex}`,
          subjectId,
          subjectName: name,
          description: [
            "Contrôle de connaissances",
            "Devoir maison",
            "Participation orale",
          ][gradeIndex],
          givenAt: addDays(
            period.start,
            14 + subjectIndex * 5 + gradeIndex * 18
          ),
          coefficient: gradeIndex === 0 ? 2 : 1,
          outOf: { value: 20 },
          studentScore: {
            value: Math.max(8, adjustedAverage + gradeIndex - 1),
            outOf: 20,
          },
          averageScore: { value: classAverage, outOf: 20 },
          minScore: { value: 6.5, outOf: 20 },
          maxScore: { value: 19.5, outOf: 20 },
          createdByAccount: accountId,
        })),
      };
    }
  );

  return {
    studentOverall: { value: 15.2 - (periodIndex - 1) * 0.2, outOf: 20 },
    classAverage: { value: 13.3, outOf: 20 },
    rank: { value: 5, outOf: 32 },
    subjects,
    createdByAccount: accountId,
  };
}

export function generateMockNews(
  accountId: string,
  referenceDate = new Date()
): News[] {
  const items = [
    [
      "Réunion parents-professeurs",
      "La direction",
      "Vie de l'établissement",
      "<p>La réunion parents-professeurs aura lieu jeudi à partir de 17 h 30. Le planning des salles sera affiché dans le hall.</p>",
    ],
    [
      "Nouveautés au CDI",
      "Mme Garcia, professeure documentaliste",
      "CDI",
      "<p>Une sélection de romans contemporains et de bandes dessinées est disponible au CDI. Les élèves peuvent les emprunter pendant trois semaines.</p>",
    ],
    [
      "Inscription à l'association sportive",
      "Service de la vie scolaire",
      "Vie scolaire",
      "<p>Les inscriptions à l'association sportive sont ouvertes jusqu'à vendredi. Une autorisation parentale est nécessaire.</p>",
    ],
    [
      "Collecte solidaire",
      "Conseil de la vie lycéenne",
      "Projet citoyen",
      "<p>Le CVL organise une collecte de fournitures scolaires au profit d'une association locale.</p>",
    ],
  ] as const;

  return items.map(([title, author, category, content], index) => ({
    id: `mock-news-${index}`,
    title,
    author,
    category,
    content,
    createdAt: atTime(addDays(referenceDate, -index * 3), 10, 15),
    acknowledged: index > 1,
    question: index === 0,
    attachments: [],
    createdByAccount: accountId,
  }));
}

export function generateMockAttendance(
  accountId: string,
  referenceDate = new Date()
): Attendance {
  const year = getMockSchoolYear(referenceDate);
  return {
    createdByAccount: accountId,
    delays: [
      {
        id: `mock-delay-${year}`,
        givenAt: new Date(year, 9, 7, 8, 12),
        reason: "Retard du bus",
        justified: true,
        duration: 12,
        createdByAccount: accountId,
      },
    ],
    absences: [
      {
        id: `mock-absence-${year}`,
        from: new Date(year, 10, 18, 8),
        to: new Date(year, 10, 18, 12),
        reason: "Rendez-vous médical",
        timeMissed: 240,
        justified: true,
        createdByAccount: accountId,
      },
    ],
    observations: [
      {
        id: `mock-observation-${year}`,
        givenAt: new Date(year, 9, 14, 11, 20),
        sectionName: "Travail et comportement",
        sectionType: ObservationType.Observation,
        subjectName: "Français",
        shouldParentsJustify: false,
        reason: "Travail non présenté au début du cours.",
      },
      {
        id: `mock-encouragement-${year}`,
        givenAt: new Date(year, 11, 2, 15, 30),
        sectionName: "Encouragement",
        sectionType: ObservationType.Encouragement,
        subjectName: "Histoire-Géographie",
        shouldParentsJustify: false,
        reason: "Exposé particulièrement clair et bien documenté.",
      },
    ],
    punishments: [
      {
        id: `mock-punishment-${year}`,
        givenAt: new Date(year + 1, 0, 16, 16),
        givenBy: "Mme Leroy, CPE",
        exclusion: false,
        duringLesson: false,
        nature: "Retenue",
        duration: 60,
        homework: {
          text: "Rédiger une réflexion sur le respect du règlement intérieur.",
          documents: [],
        },
        reason: {
          text: "Usage du téléphone dans les couloirs.",
          circumstances:
            "Téléphone utilisé pendant un intercours malgré un premier rappel.",
          documents: [],
        },
      },
    ],
  };
}
