import { PronoteApiClient } from "@/services/pronote/api-client";
import { Grade, GradeScore, Period, PeriodGrades, Subject } from "@/services/shared/grade";
import { isZeroCountedStatus, normalizeGradeStatus } from "@/utils/grades/status";
import { error } from "@/utils/logger/logger";

export async function fetchPronoteGrades(
  authToken: string,
  accountId: string,
  period: Period,
  childName?: string
): Promise<PeriodGrades> {
  try {
    const data = await PronoteApiClient.getGrades(authToken, period.name, childName);
    const subjectsMap: Record<string, Subject> = {};

    for (const g of data.grades || []) {
      const subjectName = g.subject || "Matière";
      const subjectId = g.subject_id || subjectName.toLowerCase().replace(/\s+/g, "_");
      const subjAvg = data.averages?.subjects?.[subjectName];

      if (!subjectsMap[subjectId]) {
        subjectsMap[subjectId] = {
          id: subjectId,
          name: subjectName,
          classAverage: { value: subjAvg?.class_average ?? 0 },
          outOf: { value: subjAvg?.out_of ?? 20 },
          grades: [],
        };
      }

      const hasValue = g.value !== null && g.value !== undefined;
      const statusCode: string | null = (g.status_code as string | undefined) ?? null;
      const rawGrade: string | null = (g.raw_grade as string | undefined) ?? null;
      const rawStatus = statusCode || rawGrade || "NonNote";
      const normalized = normalizeGradeStatus(statusCode) ?? normalizeGradeStatus(rawGrade);
      // AbsentZero / NonRenduZero comptent comme 0 dans la moyenne Pronote.
      const countsAsZero = !hasValue && isZeroCountedStatus(normalized);
      const mappedGrade: Grade = {
        id: g.id,
        subjectId,
        subjectName,
        description: g.description || "",
        comment: g.comment ?? "",
        isBonus: Boolean(g.is_bonus ?? false),
        isOptional: Boolean(g.is_optionnal ?? false),
        isOutOf20: Boolean(g.is_out_of_20 ?? false),
        givenAt: new Date(g.date),
        bonus: Boolean(g.is_bonus ?? false),
        optional: Boolean(g.is_optionnal ?? false),
        outOf: g.out_of !== undefined ? { value: g.out_of } : { value: 20 },
        // Coefficient 0 = non compté (exclu de la moyenne). ?? préserve le 0,
        // contrairement à || qui le transformerait en 1.
        coefficient: g.coefficient ?? 1,
        statusCode,
        rawGrade,
        studentScore: hasValue
          ? { value: g.value, outOf: g.out_of ?? 20 }
          : countsAsZero
            ? { value: 0, outOf: g.out_of ?? 20, status: rawStatus }
            : { value: 0, disabled: true, status: rawStatus },
        averageScore: g.average !== null && g.average !== undefined ? { value: g.average } : undefined,
        maxScore: g.max !== null && g.max !== undefined ? { value: g.max } : undefined,
        minScore: g.min !== null && g.min !== undefined ? { value: g.min } : undefined,
        createdByAccount: accountId,
      };

      subjectsMap[subjectId].grades?.push(mappedGrade);
    }

    const subjects = Object.values(subjectsMap);

    return {
      studentOverall: { value: data.averages?.overall ?? 0 },
      classAverage: { value: data.averages?.class_overall ?? 0 },
      subjects,
      createdByAccount: accountId,
    };
  } catch (err) {
    error(`Failed to fetch grades: ${err}`, "fetchPronoteGrades");
    return {
      studentOverall: { value: 0 },
      classAverage: { value: 0 },
      subjects: [],
      createdByAccount: accountId,
    };
  }
}

export async function fetchPronoteGradePeriods(
  authToken: string,
  accountId: string,
  childName?: string
): Promise<Period[]> {
  try {
    const data = await PronoteApiClient.getGradePeriods(authToken, childName);
    return (data.periods || []).map((p: any) => ({
      id: p.id || p.name,
      name: p.name,
      start: p.start ? new Date(p.start) : new Date(),
      end: p.end ? new Date(p.end) : new Date(),
      createdByAccount: accountId,
    }));
  } catch (err) {
    error(`Failed to fetch grade periods: ${err}`, "fetchPronoteGradePeriods");
    return [];
  }
}