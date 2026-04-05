import { Client } from "@blockshub/blocksdirecte";

import { getSubjectAverage } from "@/utils/grades/algorithms/subject";
import { warn } from "@/utils/logger/logger";

import { Grade, GradeScore, Period, PeriodGrades, Subject, } from "../shared/grade";
import { SkillChipLevel } from "@/ui/components/SkillChip";
import { SkillsColorsPalette } from "@/constants/SkillsColorsPalette";

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
    const skillColors = {
      insufficient: overview.parametrage.couleurEval1,
      weak: overview.parametrage.couleurEval2,
      almostProficient: overview.parametrage.couleurEval3,
      satisfactory: overview.parametrage.couleurEval4,
    };
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
          description: s.descriptif,
          score: parseSkillLevel(parseInt(s.valeur), skillColors),
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

function parseSkillLevel(value: number, colors: {insufficient: string, weak: string, almostProficient: string, satisfactory: string}): string | SkillChipLevel {
  switch (value) {
    case 1:
      return parseColor(colors.insufficient);
    case 2:
      return parseColor(colors.weak);
    case 3:
      return parseColor(colors.almostProficient);
    case 4:
      return parseColor(colors.satisfactory);
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

function hexToRgb(hex: string): {r: number; g: number; b: number} | undefined {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : undefined;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}


function parseColor(hex: string): string {
  const color: { r: number; g: number; b: number } | undefined = hexToRgb(hex);

  if (!color) return hex;

  const palette: ({r: number, g: number, b: number} | undefined)[] = SkillsColorsPalette.map((c) => hexToRgb(c));

  let closestColor = palette[0]!;
  let minDistance = Number.MAX_VALUE;

  for (const p of palette) {
    if (p === undefined) continue;

    const distance = Math.sqrt(
      Math.pow(color.r - p.r, 2) +
        Math.pow(color.g - p.g, 2) +
        Math.pow(color.b - p.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = p;
    }
  }

  return `#${componentToHex(closestColor.r)}${componentToHex(closestColor.g)}${componentToHex(closestColor.b)}`;
}