import {
  Grade,
  GradeScore,
  PeriodGrades,
  Subject,
} from "@/services/shared/grade";

import { MyCpeApiClient } from "./api";
import { MyCpeCourseGrades, MyCpeExam } from "./models";

const OUT_OF_TWENTY = 20;

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const text = value.trim();
  return text || undefined;
};

export function parseMyCpeNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value !== "string") {
    return undefined;
  }

  const match = value
    .replace(/[\s\u00a0]/g, "")
    .replace(",", ".")
    .match(/[-+]?\d+(?:\.\d+)?/);
  if (!match) {
    return undefined;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const parseDate = (value: unknown): Date | undefined => {
  const text = cleanText(value);
  if (!text) {
    return undefined;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const validationStatus = (validated: unknown): string | undefined => {
  if (validated === true) {
    return "Validé";
  }
  if (validated === false) {
    return "Non validé";
  }
  return undefined;
};

const appreciationStatus = (exam: MyCpeExam): string | undefined => {
  const statuses: string[] = [];
  if (exam["est_absent"] === true) {
    statuses.push("Absent");
  }
  if (exam["est_non_noter"] === true) {
    statuses.push("Non noté");
  }

  if (Array.isArray(exam.appreciation)) {
    exam.appreciation.forEach(value => {
      if (typeof value === "string" || typeof value === "number") {
        const text = String(value).trim();
        if (text && !statuses.includes(text)) {
          statuses.push(text);
        }
      }
    });
  }

  return statuses.length > 0 ? statuses.join(" · ") : undefined;
};

const mapExam = (
  exam: MyCpeExam,
  accountId: string,
  subjectId: string,
  subjectName: string,
  index: number
): Grade => {
  const score = parseMyCpeNumber(exam.note);
  const status = appreciationStatus(exam);
  const disabled =
    exam["est_absent"] === true ||
    exam["est_non_noter"] === true ||
    score === undefined;

  return {
    id:
      exam.id === undefined || exam.id === null
        ? `${subjectId}-exam-${index}`
        : String(exam.id),
    subjectId,
    subjectName,
    description: cleanText(exam.libelle) ?? "Épreuve",
    givenAt:
      parseDate(exam["date_obtention"]) ?? parseDate(exam["date_debut_evt"]),
    coefficient: 1,
    outOf: { value: OUT_OF_TWENTY },
    studentScore: {
      value: score ?? 0,
      outOf: OUT_OF_TWENTY,
      disabled,
      status,
    },
    createdByAccount: accountId,
  };
};

const mapCourse = (
  course: MyCpeCourseGrades,
  accountId: string,
  index: number
): Subject => {
  const code = cleanText(course["cours_code"]);
  const name = cleanText(course["cours_libelle"]) ?? code ?? "Cours";
  const subjectId =
    course.id === undefined || course.id === null
      ? (code ?? `mycpe-subject-${index}`)
      : String(course.id);
  const registration = course["inscription_cours"];
  const average = parseMyCpeNumber(registration?.moyenne);
  const validated = validationStatus(registration?.["est_validee"]);
  const creditsObtained = parseMyCpeNumber(
    registration?.["nombre_credits_obtenus"]
  );
  const creditsPotential = parseMyCpeNumber(
    registration?.["nombre_credits_potentiels"]
  );

  let credits: GradeScore | undefined;
  if (creditsObtained !== undefined || creditsPotential !== undefined) {
    credits = {
      value: creditsObtained ?? 0,
      outOf: creditsPotential,
      disabled: creditsObtained === undefined,
      status: validated,
    };
  }

  return {
    id: subjectId,
    name,
    studentAverage: {
      value: average ?? 0,
      outOf: OUT_OF_TWENTY,
      disabled: average === undefined,
      status: validated,
    },
    classAverage: {
      value: 0,
      outOf: OUT_OF_TWENTY,
      disabled: true,
      status: "Non disponible",
    },
    outOf: { value: OUT_OF_TWENTY },
    credits,
    grades: (Array.isArray(course.epreuves) ? course.epreuves : []).map(
      (exam, examIndex) => mapExam(exam, accountId, subjectId, name, examIndex)
    ),
  };
};

export function mapMyCpeGrades(
  courses: MyCpeCourseGrades[],
  accountId: string
): PeriodGrades {
  const subjects = courses.map((course, index) =>
    mapCourse(course, accountId, index)
  );
  const availableAverages = subjects
    .map(subject => subject.studentAverage)
    .filter(
      (score): score is GradeScore =>
        score !== undefined && score.disabled !== true
    );
  const overall =
    availableAverages.length > 0
      ? availableAverages.reduce((sum, score) => sum + score.value, 0) /
        availableAverages.length
      : 0;

  return {
    createdByAccount: accountId,
    studentOverall: {
      value: overall,
      outOf: OUT_OF_TWENTY,
      disabled: availableAverages.length === 0,
      status: availableAverages.length === 0 ? "Non disponible" : undefined,
    },
    classAverage: {
      value: 0,
      outOf: OUT_OF_TWENTY,
      disabled: true,
      status: "Non disponible",
    },
    subjects,
  };
}

export async function fetchMyCpeGrades(
  client: MyCpeApiClient,
  accountId: string
): Promise<PeriodGrades> {
  return mapMyCpeGrades(await client.getGrades(), accountId);
}
