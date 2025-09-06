import { Account, GradeKind, GradeValue, Session, studentGrades } from "pawdirecte";

import { generateId } from "@/utils/generateId";
import { warn } from "@/utils/logger/logger";

import { AttachmentType } from "../shared/attachment";
import { GradeScore, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchEDGradePeriods(session: Session, account: Account, accountId: string): Promise<Period[]> {
  try {
    const grades = await studentGrades(session, account, "")
    return grades.periods.map(period => ({
      name: period.name,
      id: period.id,
      start: period.startDate,
      end: period.endDate,
      createdByAccount: accountId
    }))
  } catch {
    return []
  }
}

export async function fetchEDGrades(session: Session, account: Account, accountId: string, period: Period): Promise<PeriodGrades> {
  try {
    const grades = await studentGrades(session, account, "")
    
    if (!grades?.overview?.[period.id!]) {
      warn("Invalid grades data structure or period not found")
      return {
        createdByAccount: accountId,
        classAverage: { value: 16.66, disabled: true },
        studentOverall: { value: 16.66, disabled: true },
        subjects: []
      }
    }
    
    const overview = grades.overview[period.id!];
    const subjects: Record<string, Subject> = {}

    if (overview.subjects) {
      for (const subject of overview.subjects) {
        subjects[subject.name] = {
          id: subject.id,
          name: subject.name,
          studentAverage: mapEDGradeScore(subject.studentAverage),
          classAverage: mapEDGradeScore(subject.classAverage),
          minimum: mapEDGradeScore(subject.minAverage),
          maximum: mapEDGradeScore(subject.maxAverage),
          outOf: mapEDGradeScore(subject.outOf),
          grades: []
        }
      }
    }

    if (grades.grades) {
      for (const grade of grades.grades) {
        if (subjects[grade.subject.name]) {
          subjects[grade.subject.name].grades.push({
            id: generateId(JSON.stringify(grade)),
            subjectId: grade.subject.id,
            subjectName: grade.subject.name,
            description: grade.comment,
            givenAt: grade.date,
            subjectFile: {
              type: AttachmentType.LINK,
              name: "Sujet",
              url: grade.subjectFilePath,
              createdByAccount: accountId
            },
            correctionFile: {
              type: AttachmentType.LINK,
              name: "Sujet",
              url: grade.correctionFilePath,
              createdByAccount: accountId
            },
            bonus: false,
            optional: grade.isOptional,
            outOf: { value: grade.outOf },
            coefficient: grade.coefficient,
            studentScore: mapEDGradeScore(grade.value),
            averageScore: mapEDGradeScore(grade.average),
            minScore: mapEDGradeScore(grade.min),
            maxScore: mapEDGradeScore(grade.max),
            createdByAccount: accountId
          })
        }
      }
    }

    return {
      createdByAccount: accountId,
      classAverage: mapEDGradeScore(overview.classAverage),
      studentOverall: mapEDGradeScore(overview.overallAverage),
      subjects: Object.values(subjects).filter(subject => subject.grades.length > 0)
    }
  } catch (error) {
    warn(String(error))
    return {
      createdByAccount: accountId,
      classAverage: { value: 16.66, disabled: true },
      studentOverall: { value: 16.66, disabled: true },
      subjects: []
    }
  }
}

function mapEDGradeScore(grade: GradeValue): GradeScore {
  switch(grade.kind) {
  case GradeKind.Grade:
    return { value: grade.points }
  case GradeKind.Absent:
    return { value: grade.points, disabled: true, status: "Abs."}
  case GradeKind.Error:
    return { value: grade.points, disabled: true, status: "Erreur"}
  case GradeKind.Exempted:
    return { value: grade.points, disabled: true, status: "Disp."}
  case GradeKind.NotGraded:
    return { value: grade.points, disabled: true, status: "N. Not."}
  case GradeKind.Waiting:
    return { value: grade.points, disabled: true, status: "Attente"}
  default:
    return { value: grade.points }
  }
}