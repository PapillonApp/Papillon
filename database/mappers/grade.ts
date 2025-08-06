import { mapSubjectToShared } from "@/database/mappers/subject";
import { Grade, Period, PeriodGrades } from "@/database/models/Grades";
import { Attachment } from "@/services/shared/attachment";
import { Grade as SharedGrade, Period as SharedPeriod, PeriodGrades as SharedPeriodGrades } from "@/services/shared/grade";

export function mapPeriodToShared(period: Period): SharedPeriod {
  return {
    name: period.name,
    id: period.id,
    start: new Date(period.start),
    end: new Date(period.end),
    createdByAccount: period.createdByAccount,
		kidName: period.kidName,
    fromCache: true
  }
}

export function mapGradeToShared(grade: Grade): SharedGrade {
  return {
    id: grade.id,
    subjectId: grade.subjectId ?? "",
    description: grade.description,
    givenAt: new Date(grade.givenAt),
    subjectFile: JSON.parse(grade.subjectFile ?? "") as Attachment,
    correctionFile: JSON.parse(grade.correctionFile ?? "") as Attachment,
    bonus: grade.bonus,
    optional: grade.optional,
    outOf: grade.outOf,
    coefficient: grade.coefficient,
    studentScore: grade.studentScore,
    averageScore: grade.averageScore,
    minScore: grade.minScore,
    maxScore: grade.maxScore,
    fromCache: true,
    createdByAccount: grade.createdByAccount
  }
}

export function mapPeriodGradesToShared(data: PeriodGrades): SharedPeriodGrades {
  return {
    studentOverall: data.studentOverall,
    classAverage: data.classAverage,
    subjects: data.subjects.map(mapSubjectToShared),
    createdByAccount: data.createdByAccount
  }
}