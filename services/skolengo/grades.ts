import { Grade as SkolengoGrade, Kind,Skolengo, Subject as SkolengoSubjects } from "skolengojs";

import { error } from "@/utils/logger/logger";

import { Grade, GradeScore, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchSkolengoGradesForPeriod(session: Skolengo, accountId: string, period: string, kid?: Skolengo): Promise<PeriodGrades> {
  const getGrades = async (sessionToUse: Skolengo, kidName?: string): Promise<PeriodGrades> => {
    const subjects = await sessionToUse.GetGradesForPeriod(period)
    const studentOverall: GradeScore = {
      value: subjects.reduce((sum, subject) => sum + subject.value, 0) / subjects.length,
      disabled: false
    }
    const classAverage: GradeScore = {
      value: subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length,
      disabled: false
    }

    return {
      createdByAccount: accountId,
      studentOverall,
      classAverage,
      subjects: mapSkolengoSubjects(subjects, accountId, kidName)
    }
  }
  if (session.kind === Kind.STUDENT) {
    return getGrades(session)
  } 
  if (kid) {
    return getGrades(kid, `${kid.firstName} ${kid.lastName}`)
  }
  error("Kid is not valid")
	
}

export async function fetchSkolengoGradePeriods(session: Skolengo, accountId: string): Promise<Period[]> {
  const result: Period[] = []
	
  if (session.kind === Kind.STUDENT) {
    const periods = (await session.GetGradesSettings()).periods
    for (const period of periods) {
      result.push({
        name: period.label,
        id: period.id,
        start: period.startDate,
        end: period.endDate,
        createdByAccount: accountId
      })
    }
  } else {
    for (const kid of session.kids ?? []) {
      const periods = (await kid.GetGradesSettings()).periods
      for (const period of periods) {
        result.push({
          name: period.label,
          id: period.id,
          start: period.startDate,
          end: period.endDate,
          createdByAccount: accountId,
          kidName: `${kid.firstName} ${kid.lastName}`
        })
      }		
    }
  }
  return result
}

function mapSkolengoGrades(grades: SkolengoGrade[], accountId: string, kidName?: string): Grade[] {
  return grades.map(grade => ({
    id: grade.id,
    subjectId: grade.subject?.id ?? "",
    subjectName: grade.subject?.label ?? "",
    description: grade.title ?? "",
    givenAt: grade.date,
    outOf: { value: grade.outOf },
    coefficient: grade.coefficient,
    studentScore: { value: grade.value, disabled: !grade.isGraded, status: grade.notGradedReason },
    createdByAccount: accountId,
    kidName: kidName
  }))
}

function mapSkolengoSubjects(subjects: SkolengoSubjects[], accountId: string, kidName?: string): Subject[] {
  return subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    classAverage: { value: subject.average },
    studentAverage: { value: subject.value },
    outOf: { value: subject.outOf },
    grades: mapSkolengoGrades(subject.grades, accountId, kidName)
  }))
}
