
import { Client } from "@blockshub/blocksdirecte";

import { warn } from "@/utils/logger/logger";

import { Grade, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchEDGradePeriods(session: Client, accountId: string): Promise<Period[]> {
  try {
    const overview = await session.marks.getMark()
    return overview.periodes.map(period => ({
      name: period.periode,
      id: period.codePeriode,
      start: new Date(period.dateDebut),
      end: new Date(period.dateFin),
      createdByAccount: accountId
    }))
  } catch {
    return []
  }
}

export async function fetchEDGrades(session: Client, accountId: string, period: Period): Promise<PeriodGrades> {
  try {
    const overview = await session.marks.getMark()
    const periodReport = overview.periodes.find(item => item.idPeriode === period.id)
    const grades = overview.notes.filter(grade => grade.codePeriode === period.id)
    
    if (!overview || !periodReport) {
      warn("Invalid grades data structure or period not found")
      return {
        createdByAccount: accountId,
        classAverage: { value: 16.66, disabled: true },
        studentOverall: { value: 16.66, disabled: true },
        subjects: []
      }
    }
    
    const subjects: Record<string, Subject> = {}
    const allMappedGrades: Grade[] = grades.map(g => ({
      id: String(g.id),
      subjectId: g.codeMatiere,
      subjectName: g.libelleMatiere,
      description: g.commentaire,
      givenAt: new Date(g.date),
      subjectFile: undefined,
      correctionFile: undefined,
      bonus: false,
      optional: g.nonSignificatif,
      outOf: { value: Number(g.noteSur) },
      coefficient: Number(g.coef),
      studentScore: { value: Number(g.valeur) },
      averageScore: { value: Number(g.moyenneClasse) },
      minScore: { value: Number(g.minClasse) },
      maxScore: { value: Number(g.maxClasse) },
      createdByAccount: accountId
    }))
    
    for (const subject of periodReport.ensembleMatieres.disciplines) {
      subjects[subject.codeMatiere] = {
        id: subject.codeMatiere,
        name: subject.discipline,
        studentAverage: { value: Number(subject.moyenne) },
        classAverage: { value: Number(subject.moyenneClasse) },
        maximum: { value: Number(subject.moyenneMax) },
        minimum: { value: Number(subject.moyenneMin) },
        outOf: { value: 20 },
        grades: allMappedGrades.filter(grade => grade.subjectId === subject.codeMatiere)
      }
    }

    const average = grades.reduce((sum, grade) => sum + Number(grade.valeur), 0) / grades.length
    const classAverage = Object.values(subjects).reduce((sum, subject) => sum + subject.classAverage.value, 0) / Object.keys(subjects).length

    return {
      studentOverall: { value: average },
      classAverage: { value: classAverage },
      subjects: Object.values(subjects),
      createdByAccount: accountId
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
