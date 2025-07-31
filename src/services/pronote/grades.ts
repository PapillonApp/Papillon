import type { PronoteAccount } from "@/stores/account/types";
import type { Period } from "../shared/Period";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import {
  type AverageOverview,
  type Grade,
  type GradeValue,
} from "../shared/Grade";
import { decodeAttachment } from "./attachment";
import { decodePeriod } from "./period";
import pronote from "pawnote";
import { info } from "@/utils/logger/logger";

const getTab = (account: PronoteAccount): pronote.Tab => {
  if (!account.instance) throw new ErrorServiceUnauthenticated("pronote");

  const tab = account.instance.user.resources[0].tabs.get(
    pronote.TabLocation.Grades
  );
  if (!tab)
    throw new Error("Tu n'as pas accès à l'onglet 'Notes' dans PRONOTE");

  return tab;
};

export const getGradesPeriods = (
  account: PronoteAccount
): { periods: Period[]; default: string } => {
  const tab = getTab(account);
  info("PRONOTE->getGradesPeriods(): OK", "pronote");

  return {
    default: tab.defaultPeriod!.name,
    periods: tab.periods.map(decodePeriod),
  };
};

const decodeGradeValue = (
  value: pronote.GradeValue | undefined
): GradeValue => {
  if (typeof value === "undefined")
    return { value: null, disabled: true, status: "unknown" };

  switch (value.kind) {
    case pronote.GradeKind.Grade:
      return { value: value.points ?? 0, disabled: false, status: null };
    case pronote.GradeKind.Absent:
      return { value: null, disabled: true, status: "Abs" };
    case pronote.GradeKind.Exempted:
      return { value: null, disabled: true, status: "Disp" };
    case pronote.GradeKind.NotGraded:
      return { value: null, disabled: true, status: "N. Not" };
    case pronote.GradeKind.Unfit:
      return { value: null, disabled: true, status: null };
    case pronote.GradeKind.Unreturned:
      return { value: null, disabled: true, status: null };
    case pronote.GradeKind.AbsentZero:
      return { value: 0, disabled: false, status: "Abs" };
    case pronote.GradeKind.UnreturnedZero:
      return { value: 0, disabled: false, status: null };
    default:
      return { value: null, disabled: true, status: null };
  }
};

export const getGradesAndAverages = async (
  account: PronoteAccount,
  periodName: string
): Promise<{
  grades: Grade[];
  averages: AverageOverview;
}> => {
  const tab = getTab(account); // Vérifie aussi la validité de `account.instance`.
  const period = tab.periods.find((p) => p.name === periodName);
  if (!period) throw new Error("La période sélectionnée n'a pas été trouvée.");

  const overview = await pronote.gradesOverview(account.instance!, period);

  const averages: AverageOverview = {
    classOverall: decodeGradeValue(overview.classAverage),
    overall: decodeGradeValue(overview.overallAverage),
    subjects: overview.subjectsAverages.map((s) => ({
      classAverage: decodeGradeValue(s.class_average),
      color: s.backgroundColor,
      max: decodeGradeValue(s.max),
      subjectName: s.subject.name,
      id: s.subject.id ? s.subject.id.toString() : undefined,
      min: decodeGradeValue(s.min),
      average: decodeGradeValue(s.student),
      outOf: decodeGradeValue(s.outOf),
    })),
  };

  const grades: Grade[] = overview.grades.map((g) => ({
    id: buildLocalID(g),
    subjectName: g.subject.name,
    subjectId: g.subject.id ? g.subject.id.toString() : undefined,
    description: g.comment,
    timestamp: g.date.getTime(),

    subjectFile: g.subjectFile && decodeAttachment(g.subjectFile),
    correctionFile: g.correctionFile && decodeAttachment(g.correctionFile),

    isBonus: g.isBonus,
    isOptional: g.isOptional,

    outOf: decodeGradeValue(g.outOf),
    coefficient: g.coefficient ?? 1,

    student: decodeGradeValue(g.value),
    average: decodeGradeValue(g.average),
    max: decodeGradeValue(g.max),
    min: decodeGradeValue(g.min),
  }));

  return { averages, grades };
};

export const buildLocalID = (g: pronote.Grade): string =>
  `${g.subject.name}:${g.date.getTime()}/${g.comment || "none"}`;
