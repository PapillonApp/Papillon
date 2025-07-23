import { GradeKind, GradesOverview, gradesOverview, GradeValue, SessionHandle, TabLocation } from "pawnote";
import { Grade, GradeScore, Period, PeriodGrades, Subject } from "@/services/shared/grade";
import { AttachmentType } from "@/services/shared/attachment";
import { error } from "@/utils/logger/logger";

/**
 * Fetches grades from PRONOTE for a specified period.
 * @param {SessionHandle} session - The session handles for the PRONOTE account.
 * @param {string} accountId - The ID of the account requesting the homeworks.
 * @param {string} period - The name of the period for which to fetch grades.
 * @returns {Promise<PeriodGrades>} A promise that resolves to PeriodGrades.
 */
export async function fetchPronoteGrades(session: SessionHandle, accountId: string, period: string): Promise<PeriodGrades> {
  if (!session) {
    error("Session is undefined", "fetchPronoteGrades");
  }

  const gradeTab = session.user.resources[0].tabs.get(TabLocation.Grades);
  if (!gradeTab) {
    error("Grades tab not found in session", "fetchPronoteGrades");
  }

  const pawnotePeriod = gradeTab.periods.find(p => p.name === period);
  if (!pawnotePeriod) {
    error(`Period "${period}" not found in grades tab`, "fetchPronoteGrades");
  }

  const grades = await gradesOverview(session, pawnotePeriod);

  return {
    studentOverall: mapGradeValueToScore(grades.overallAverage),
    classAverage: mapGradeValueToScore(grades.classAverage),
    subjects: mapSubjectGrades(grades, accountId),
    createdByAccount: accountId
  };
}

/**
 * Fetches all grade periods from PRONOTE.
 * @param {SessionHandle} session - The session handle for the PRONOTE session.
 * @param {string} accountId - The ID of the account making the request.
 * @return {Promise<Array<Period>>} - A promise that resolves to an array of grade periods.
 */
export async function fetchPronoteGradePeriods(session: SessionHandle, accountId: string): Promise<Period[]> {
  const accountTab = session.user.resources[0].tabs.get(TabLocation.Grades);
  if (!accountTab) {
    error("Grades tab not found in session", "fetchPronotePeriods");
  }

  return accountTab.periods.map(p => ({
    id: p.id,
    name: p.name,
    start: p.startDate,
    end: p.endDate,
    createdByAccount: accountId
  }));
}

/**
 * Maps the grade overview to an array of subjects with their respective grades.
 * @param grades
 * @param accountId
 */
function mapSubjectGrades(grades: GradesOverview, accountId: string): Subject[] {
  const subjects: Subject[] = [];

  const allMappedGrades: Grade[] = grades.grades.map(g => ({
    id: g.id,
    subjectId: g.subject.id,
    description: g.comment,
    givenAt: g.date,
    subjectFile: g.subjectFile ? {
      ...g.subjectFile,
      type: AttachmentType.FILE,
      createdByAccount: accountId
    } : undefined,
    correctionFile: g.correctionFile ? {
      ...g.correctionFile,
      type: AttachmentType.FILE,
      createdByAccount: accountId
    } : undefined,
    bonus: g.isBonus ?? false,
    optional: g.isOptional ?? false,
    outOf: mapGradeValueToScore(g.outOf),
    coefficient: g.coefficient,
    studentScore: mapGradeValueToScore(g.value),
    averageScore: mapGradeValueToScore(g.average),
    minScore: mapGradeValueToScore(g.min),
    maxScore: mapGradeValueToScore(g.max),
    createdByAccount: accountId
  }));

  for (const average of grades.subjectsAverages) {
    const subjectId = average.subject.id;

    const subjectGrades = allMappedGrades.filter(g => g.subjectId === subjectId);

    subjects.push({
      id: subjectId,
      name: average.subject.name,
      studentAverage: mapGradeValueToScore(average.student),
      classAverage: mapGradeValueToScore(average.class_average),
      maximum: mapGradeValueToScore(average.max),
      minimum: mapGradeValueToScore(average.min),
      outOf: mapGradeValueToScore(average.outOf),
      grades: subjectGrades
    });
  }

  return subjects;
}

/**
 * Maps a GradeValue to a GradeScore.
 * @param grade
 */
function mapGradeValueToScore(grade: GradeValue | undefined): GradeScore {
  if (typeof grade === "undefined")
  {return { disabled: true, status: "Inconnu" };}

  switch (grade.kind) {
  case GradeKind.Grade:
    return { value: grade.points ?? 0 };
  case GradeKind.NotGraded:
    return { disabled: true, status: "N. Not." };
  case GradeKind.Absent:
    return { disabled: true, status: "Abs." };
  case GradeKind.AbsentZero:
    return { value: 0, disabled: false, status: "Abs.*" };
  case GradeKind.Exempted:
    return { disabled: true, status: "Disp." };
  case GradeKind.Unfit:
    return { disabled: true, status: "Disp." };
  case GradeKind.Unreturned:
    return { disabled: true, status: "N. Rendu" };
  case GradeKind.UnreturnedZero:
    return { value: 0, disabled: false, status: "N. Rendu*" };
  default:
    return { disabled: true, status: "Inconnu" };
  }
}