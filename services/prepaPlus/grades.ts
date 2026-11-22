import { DomUtils, parseDocument } from "htmlparser2";

import { parseFrenchDate } from "@/services/shared/frenchDate";
import type {
  Grade,
  GradeScore,
  Period,
  PeriodGrades,
  Subject,
} from "@/services/shared/grade";

type Element = ReturnType<typeof DomUtils.findAll>[number];

const text = (node: Element) =>
  DomUtils.textContent(node).replace(/\s+/g, " ").trim();
const cellsOf = (row: Element) =>
  DomUtils.getChildren(row).filter(
    (node): node is Element =>
      node.type === "tag" && (node.name === "td" || node.name === "th")
  );
const rowsOf = (table: Element) =>
  DomUtils.findAll(node => node.name === "tr", table.children);

function numeric(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const result = Number(value.trim().replace(",", "."));
  return Number.isFinite(result) ? result : undefined;
}

const score = (value?: number): GradeScore | undefined =>
  value === undefined ? undefined : { value };

function subjectId(subject: string) {
  const normalized = subject
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
  return normalized === "maths"
    ? "mathematiques"
    : normalized === "phys"
      ? "physique"
      : normalized;
}

export function parseWrittenGrades(html: string, serviceId: string): Grade[] {
  const document = parseDocument(html);
  const blocks = DomUtils.findAll(
    node => node.name === "table" || node.name === "h4",
    document.children
  );
  const grades: Grade[] = [];
  let subject = "";
  let found = false;
  for (const node of blocks) {
    if (node.name === "h4") {
      subject = text(node);
      continue;
    }
    const [header, ...rows] = rowsOf(node);
    if (
      !header ||
      cellsOf(header).map(text).slice(0, 5).join("|") !==
        "Période|Devoir|Thème|Date|Note"
    ) {
      continue;
    }
    found = true;
    for (const row of rows) {
      const [, assessment, theme, date, mark, rank, total, average] =
        cellsOf(row).map(text);
      const value = numeric(mark);
      const scale = numeric(total);
      const givenAt = date && parseFrenchDate(date);
      if (
        !subject ||
        !assessment ||
        !givenAt ||
        value === undefined ||
        !scale ||
        scale < 0
      ) {
        continue;
      }
      grades.push({
        id: `prepa-plus:written:${subjectId(subject)}:${date}:${assessment}`,
        subjectId: subjectId(subject),
        subjectName: subject,
        description: [assessment, theme].filter(Boolean).join(" — "),
        givenAt,
        coefficient: 1,
        outOf: { value: scale },
        studentScore: { value },
        averageScore: score(numeric(average)),
        rank: score(numeric(rank)),
        createdByAccount: serviceId,
      });
    }
  }
  if (!found) {
    throw new Error("Prépa Plus did not return the written grades table.");
  }
  return grades;
}

function academicYear(date: Date) {
  return date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

export function parseOralGrades(
  html: string,
  referenceDate: Date,
  serviceId: string
): Grade[] {
  const document = parseDocument(html);
  for (const table of DomUtils.findAll(
    node => node.name === "table",
    document.children
  )) {
    const [header, ...rows] = rowsOf(table);
    const [weekHeader, ...subjects] = header ? cellsOf(header).map(text) : [];
    if (weekHeader !== "Semaine") {
      continue;
    }
    return rows.flatMap(row => {
      const [label, ...cells] = cellsOf(row);
      const week = label && text(label);
      const match = week && week.match(/:\s*(\d{1,2})\/(\d{1,2})/);
      if (!match) {
        return [];
      }
      const year = academicYear(referenceDate) + Number(Number(match[2]) < 8);
      const date = parseFrenchDate(`${match[1]}/${match[2]}/${year}`);
      if (!date) {
        return [];
      }
      return cells.flatMap((cell, index) => {
        const subject = subjects[index];
        const span = DomUtils.findOne(
          node => node.name === "span",
          cell.children
        );
        const mark = span ? numeric(text(span)) : undefined;
        if (!subject || mark === undefined) {
          return [];
        }
        const fields = (span?.attribs.title ?? "")
          .split(";")
          .map(value => value.trim());
        const average = numeric(
          fields.find(value => value.startsWith("Moy:"))?.slice(4)
        );
        const rank = numeric(
          fields
            .find(value => value.startsWith("Rg:"))
            ?.slice(3)
            .split("/")[0]
        );
        return [
          {
            id: `prepa-plus:oral:${subjectId(subject)}:${year}:${week}`,
            subjectId: subjectId(subject),
            subjectName: subject,
            description: `Colle — ${week}`,
            givenAt: date,
            coefficient: 1,
            outOf: { value: 20 },
            studentScore: { value: mark },
            averageScore: score(average),
            rank: score(rank),
            createdByAccount: serviceId,
          },
        ];
      });
    });
  }
  throw new Error("Prépa Plus did not return the oral grades table.");
}

export function getPrepaPlusPeriods(
  grades: Grade[],
  serviceId: string
): Period[] {
  const years = new Set(
    grades.flatMap(grade =>
      grade.givenAt ? [academicYear(grade.givenAt)] : []
    )
  );
  return Array.from(years, year => ({
    id: `prepa-plus:${serviceId}:${year}`,
    name: `${year}–${year + 1}`,
    start: new Date(year, 7, 1),
    end: new Date(year + 1, 7, 1),
    createdByAccount: serviceId,
  }));
}

function mean(
  grades: Grade[],
  key: "studentScore" | "averageScore"
): GradeScore {
  const values = grades.flatMap(grade => {
    const value = grade[key]?.value;
    return value !== undefined && grade.outOf?.value
      ? [(value * 20) / grade.outOf.value]
      : [];
  });
  return values.length
    ? { value: values.reduce((sum, value) => sum + value, 0) / values.length }
    : { value: 0, disabled: true };
}

export function makePeriodGrades(
  grades: Grade[],
  serviceId: string
): PeriodGrades {
  const grouped = new Map<string, Grade[]>();
  for (const grade of grades) {
    const group = grouped.get(grade.subjectId) ?? [];
    group.push(grade);
    grouped.set(grade.subjectId, group);
  }
  const subjects: Subject[] = Array.from(grouped, ([id, subjectGrades]) => ({
    id,
    name: subjectGrades[0].subjectName,
    studentAverage: mean(subjectGrades, "studentScore"),
    classAverage: mean(subjectGrades, "averageScore"),
    outOf: { value: 20 },
    grades: subjectGrades,
  }));
  return {
    subjects,
    studentOverall: mean(grades, "studentScore"),
    classAverage: mean(grades, "averageScore"),
    createdByAccount: serviceId,
  };
}
