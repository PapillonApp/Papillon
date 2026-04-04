import { Client } from "@blockshub/blocksdirecte";

import { getSubjectAverage } from "@/utils/grades/algorithms/subject";
import { warn } from "@/utils/logger/logger";

import { Grade, GradeScore, Period, PeriodGrades, Subject, } from "../shared/grade";
import { SkillChipLevel } from "@/ui/components/SkillChip";

export async function fetchEDGradePeriods(
  session: Client,
  accountId: string
): Promise<Period[]> {
  try {
    const overview = await session.marks.getMark();
    return overview.periodes.map(period => ({
      name: period.periode,
      id: period.codePeriode,
      start: new Date(period.dateDebut),
      end: new Date(period.dateFin),
      createdByAccount: accountId,
    }));
  } catch {
    return [];
  }
}

export async function fetchEDGrades(
  session: Client,
  accountId: string,
  period: Period
): Promise<PeriodGrades> {
  try {
    const overview = await session.marks.getMark();
    const periodReport = overview.periodes.find(
      item => item.idPeriode === period.id
    );
    const grades = overview.notes.filter(
      grade => grade.codePeriode === period.id
    );

    if (!overview || !periodReport) {
      warn("Invalid grades data structure or period not found");
      return {
        createdByAccount: accountId,
        classAverage: { value: 16.66, disabled: true },
        studentOverall: { value: 16.66, disabled: true },
        subjects: [],
      };
    }

    const subjects: Record<string, Subject> = {};
    const allMappedGrades: Grade[] = grades.map(g => {
      return {
        id: String(g.id),
        subjectId: g.codeMatiere,
        subjectName: g.libelleMatiere,
        description: g.commentaire,
        givenAt: new Date(g.date),
        subjectFile: undefined,
        correctionFile: undefined,
        bonus: false,
        optional: g.nonSignificatif,
        outOf: parseGradeValue(g.noteSur),
        coefficient: Number(g.coef),
        studentScore: parseGradeValue(g.valeur),
        averageScore: parseGradeValue(g.moyenneClasse),
        minScore: parseGradeValue(g.minClasse),
        maxScore: parseGradeValue(g.maxClasse),
        createdByAccount: accountId,
        skills: g.elementsProgramme.map(s => ({
          name: s.libelleCompetence,
          score: parseSkillLevel(parseInt(s.valeur)),
        })),
      };
    });

    for (const subject of periodReport.ensembleMatieres.disciplines) {
      const grades = allMappedGrades.filter(
        grade => grade.subjectId === subject.codeMatiere
      );
      subjects[subject.codeMatiere] = {
        id: subject.codeMatiere,
        name: subject.discipline,
        studentAverage: parseSubjectAverage(subject.moyenne, grades),
        classAverage: parseGradeValue(subject.moyenneClasse) ?? {
          disabled: true,
          value: -1,
        },
        maximum: parseGradeValue(subject.moyenneMax),
        minimum: parseGradeValue(subject.moyenneMin),
        outOf: { value: 20 },
        grades,
      };
    }

    const average =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + Number(grade.valeur), 0) /
          grades.length
        : 0;
    const subjectValues = Object.values(subjects);
    const classAverage =
      subjectValues.length > 0
        ? subjectValues.reduce(
            (sum, subject) => sum + subject.classAverage.value,
            0
          ) / subjectValues.length
        : 0;

    return {
      studentOverall: { value: average },
      classAverage: { value: classAverage },
      subjects: Object.values(subjects).filter(
        subject => subject.grades?.length
      ),
      createdByAccount: accountId,
    };
  } catch (error) {
    warn(String(error));
    return {
      createdByAccount: accountId,
      classAverage: { value: 16.66, disabled: true },
      studentOverall: { value: 16.66, disabled: true },
      subjects: [],
    };
  }
}

function parseSkillLevel(value: number): SkillChipLevel {
  switch (value) {
    case 1:
      return SkillChipLevel.Insufficient;
    case 2:
      return SkillChipLevel.Weak;
    case 3:
      return SkillChipLevel.AlmostProficient;
    case 4:
      return SkillChipLevel.Satisfactory;
    case -1:
      return SkillChipLevel.Absent;
    case -2:
      return SkillChipLevel.Exempt;
    default:
      return SkillChipLevel.NotGraded;
  }
}

function parseSubjectAverage(
  current: string,
  grades: Grade[]
): GradeScore | undefined {
  const parsedAverage = parseGradeValue(current);
  if (parsedAverage) return parsedAverage;

  const estimatedAverage = getSubjectAverage(grades);
  if (estimatedAverage >= 0) return { value: estimatedAverage };

  return undefined;
}

function parseGradeValue(value: string): GradeScore | undefined {
  const score = parseFloat(value.replace(",", "."));
  if (!isNaN(score)) {
    return { value: score };
  }
  return undefined;
}