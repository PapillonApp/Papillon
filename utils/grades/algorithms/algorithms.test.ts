import { describe, expect, it } from "@jest/globals";

import { Grade } from "@/services/shared/grade";

import {
  getSubjectAverageByProperty,
  PapillonSubjectAvgByProperty,
} from "./helpers";
import PapillonMedian from "./median";
import PapillonSubjectAvg, { getSubjectAverage } from "./subject";
import PapillonWeightedAvg from "./weighted";

let gradeCounter = 0;

function makeGrade(
  value: number,
  options: {
    subjectId?: string;
    outOf?: number;
    coefficient?: number;
    bonus?: boolean;
    optional?: boolean;
    disabled?: boolean;
    averageScore?: number;
  } = {}
): Grade {
  gradeCounter += 1;
  const subjectId = options.subjectId ?? "math";

  return {
    id: `grade-${gradeCounter}`,
    subjectId,
    subjectName: subjectId,
    description: `Eval ${gradeCounter}`,
    coefficient: options.coefficient ?? 1,
    bonus: options.bonus ?? false,
    optional: options.optional ?? false,
    outOf: { value: options.outOf ?? 20 },
    studentScore: {
      value,
      disabled: options.disabled ?? false,
    },
    averageScore:
      options.averageScore !== undefined
        ? { value: options.averageScore }
        : undefined,
    createdByAccount: "test-account",
  };
}

describe("Grade calculation algorithms", () => {
  describe("standard averages without optional or bonus grades", () => {
    it("returns -1 for empty or invalid grade lists (and 0 for PapillonSubjectAvgByProperty)", () => {
      expect(getSubjectAverage([])).toBe(-1);
      expect(getSubjectAverageByProperty([])).toBe(-1);
      expect(PapillonSubjectAvg([])).toBe(-1);
      expect(PapillonWeightedAvg([])).toBe(-1);
      expect(PapillonMedian([])).toBe(-1);
      expect(PapillonSubjectAvgByProperty([])).toBe(0);

      const onlyInvalid = [
        makeGrade(14, { disabled: true }),
        makeGrade(14, { coefficient: 0 }),
        makeGrade(-1),
      ];
      expect(getSubjectAverage(onlyInvalid)).toBe(-1);
      expect(PapillonSubjectAvg(onlyInvalid)).toBe(-1);
      expect(PapillonWeightedAvg(onlyInvalid)).toBe(-1);
      expect(PapillonMedian(onlyInvalid)).toBe(-1);
    });

    it("computes weighted subject and overall averages identically on standard scales", () => {
      const grades = [
        makeGrade(14, { subjectId: "math", coefficient: 2 }),
        makeGrade(10, { subjectId: "math", coefficient: 1 }),
        makeGrade(8, { subjectId: "french", outOf: 10, coefficient: 1 }),
        makeGrade(6, { subjectId: "french", outOf: 10, coefficient: 1 }),
      ];

      expect(getSubjectAverage(grades.slice(0, 2))).toBeCloseTo(38 / 3, 6);
      expect(getSubjectAverage(grades.slice(2, 4))).toBeCloseTo(14, 6);
      expect(PapillonSubjectAvg(grades)).toBeCloseTo((38 / 3 + 14) / 2, 6);
      expect(PapillonWeightedAvg(grades)).toBeCloseTo(
        (14 * 2 + 10 + 16 + 12) / 5,
        6
      );
    });

    it("ignores student optional/bonus rules when computing class averageScore", () => {
      const grades = [
        makeGrade(18, { optional: true, averageScore: 10 }),
        makeGrade(16, { bonus: true, averageScore: 12 }),
        makeGrade(14, { averageScore: 14 }),
      ];

      expect(getSubjectAverageByProperty(grades, "averageScore")).toBeCloseTo(
        12,
        6
      );
      expect(PapillonSubjectAvgByProperty(grades, "averageScore")).toBeCloseTo(
        12,
        6
      );
    });
  });

  describe("optional grades (greedy descending)", () => {
    it("excludes an optional grade that lowers the average and includes one that improves it", () => {
      const lowered = [makeGrade(14), makeGrade(10, { optional: true })];
      expect(getSubjectAverage(lowered)).toBeCloseTo(14, 6);
      expect(getSubjectAverageByProperty(lowered)).toBeCloseTo(14, 6);
      expect(PapillonWeightedAvg(lowered)).toBeCloseTo(14, 6);

      const equal = [makeGrade(14), makeGrade(14, { optional: true })];
      expect(getSubjectAverage(equal)).toBeCloseTo(14, 6);

      const improved = [makeGrade(10), makeGrade(14, { optional: true })];
      expect(getSubjectAverage(improved)).toBeCloseTo(12, 6);
      expect(getSubjectAverageByProperty(improved)).toBeCloseTo(12, 6);
      expect(PapillonWeightedAvg(improved)).toBeCloseTo(12, 6);
    });

    it("handles multiple mixed optional grades regardless of input order", () => {
      const dropBoth = [
        makeGrade(14),
        makeGrade(13, { optional: true }),
        makeGrade(2, { optional: true }),
      ];
      expect(getSubjectAverage(dropBoth)).toBeCloseTo(14, 6);
      expect(getSubjectAverageByProperty(dropBoth)).toBeCloseTo(14, 6);
      expect(PapillonWeightedAvg(dropBoth)).toBeCloseTo(14, 6);

      const keepBestOnly = [
        makeGrade(10),
        makeGrade(14, { optional: true }),
        makeGrade(12, { optional: true }),
      ];
      expect(getSubjectAverage(keepBestOnly)).toBeCloseTo(12, 6);
      expect(PapillonWeightedAvg(keepBestOnly)).toBeCloseTo(12, 6);

      // Unsorted optional grades: 16 must be evaluated before 11 so 11 is not included.
      const unsortedOrder = [
        makeGrade(10),
        makeGrade(11, { optional: true }),
        makeGrade(16, { optional: true }),
      ];
      expect(getSubjectAverage(unsortedOrder)).toBeCloseTo(13, 6);
      expect(getSubjectAverageByProperty(unsortedOrder)).toBeCloseTo(13, 6);
      expect(PapillonWeightedAvg(unsortedOrder)).toBeCloseTo(13, 6);

      // Keep 16 (avg 13) then 14 (avg 13.33), skip 12.
      const cascaded = [
        makeGrade(10),
        makeGrade(12, { optional: true }),
        makeGrade(14, { optional: true }),
        makeGrade(16, { optional: true }),
      ];
      expect(getSubjectAverage(cascaded)).toBeCloseTo(40 / 3, 6);
      expect(PapillonWeightedAvg(cascaded)).toBeCloseTo(40 / 3, 6);
    });

    it("handles 100%-optional subjects individually and greedily in PapillonSubjectAvg", () => {
      const optionalOnlySubject = [
        makeGrade(15, { subjectId: "latin", optional: true }),
      ];
      expect(getSubjectAverage(optionalOnlySubject)).toBeCloseTo(15, 6);
      expect(getSubjectAverageByProperty(optionalOnlySubject)).toBeCloseTo(
        15,
        6
      );

      const multiOptionalOnlySubject = [
        makeGrade(16, { subjectId: "latin", optional: true }),
        makeGrade(12, { subjectId: "latin", optional: true }),
      ];
      expect(getSubjectAverage(multiOptionalOnlySubject)).toBeCloseTo(14, 6);

      // Optional subject below mandatory average is excluded from overall average.
      const excludedSubject = [
        makeGrade(14, { subjectId: "math" }),
        makeGrade(10, { subjectId: "latin", optional: true }),
      ];
      expect(PapillonSubjectAvg(excludedSubject)).toBeCloseTo(14, 6);

      // Optional subject above mandatory average is included in overall average.
      const includedSubject = [
        makeGrade(10, { subjectId: "math" }),
        makeGrade(16, { subjectId: "latin", optional: true }),
      ];
      expect(PapillonSubjectAvg(includedSubject)).toBeCloseTo(13, 6);

      // Multiple optional-only subjects evaluated descending: 16 raises 12->14, so 13 is skipped.
      const greedySubjects = [
        makeGrade(12, { subjectId: "math" }),
        makeGrade(13, { subjectId: "theater", optional: true }),
        makeGrade(16, { subjectId: "latin", optional: true }),
      ];
      expect(PapillonSubjectAvg(greedySubjects)).toBeCloseTo(14, 6);
      expect(PapillonSubjectAvgByProperty(greedySubjects)).toBeCloseTo(14, 6);

      // No mandatory grades anywhere returns -1 for overall/weighted averages.
      expect(PapillonSubjectAvg(optionalOnlySubject)).toBe(-1);
      expect(PapillonWeightedAvg(optionalOnlySubject)).toBe(-1);
    });
  });

  describe("bonus grades", () => {
    it("gives 0 bonus points at or below 10/20 and never lowers the average", () => {
      const atTen = [makeGrade(14), makeGrade(10, { bonus: true })];
      expect(getSubjectAverage(atTen)).toBeCloseTo(14, 6);
      expect(getSubjectAverageByProperty(atTen)).toBeCloseTo(14, 6);
      expect(PapillonSubjectAvg(atTen)).toBeCloseTo(14, 6);
      expect(PapillonWeightedAvg(atTen)).toBeCloseTo(14, 6);

      const belowTen = [makeGrade(14), makeGrade(6, { bonus: true })];
      expect(getSubjectAverage(belowTen)).toBeCloseTo(14, 6);
      expect(PapillonWeightedAvg(belowTen)).toBeCloseTo(14, 6);
    });

    it("adds bonus points above 10/20 to the numerator only", () => {
      const singleWithBonus = [makeGrade(10), makeGrade(14, { bonus: true })];
      expect(getSubjectAverage(singleWithBonus)).toBeCloseTo(14, 6);
      expect(getSubjectAverageByProperty(singleWithBonus)).toBeCloseTo(14, 6);
      expect(PapillonSubjectAvg(singleWithBonus)).toBeCloseTo(14, 6);
      expect(PapillonWeightedAvg(singleWithBonus)).toBeCloseTo(14, 6);

      const twoGradesWithBonus = [
        makeGrade(10),
        makeGrade(10),
        makeGrade(14, { bonus: true }),
      ];
      expect(getSubjectAverage(twoGradesWithBonus)).toBeCloseTo(12, 6);
      expect(PapillonWeightedAvg(twoGradesWithBonus)).toBeCloseTo(12, 6);

      const weightedBonus = [
        makeGrade(10),
        makeGrade(10),
        makeGrade(14, { bonus: true, coefficient: 2 }),
      ];
      expect(getSubjectAverage(weightedBonus)).toBeCloseTo(14, 6);
    });

    it("keeps bonus points on the /20 scale when mixed with non-/20 grades and caps at 20", () => {
      const mixedScales = [
        makeGrade(5, { outOf: 10 }),
        makeGrade(10, { outOf: 20 }),
        makeGrade(14, { outOf: 20, bonus: true }),
      ];
      expect(getSubjectAverage(mixedScales)).toBeCloseTo(12, 6);
      expect(PapillonWeightedAvg(mixedScales)).toBeCloseTo(12, 6);

      const bonusOn10 = [
        makeGrade(10, { outOf: 20 }),
        makeGrade(7, { outOf: 10, bonus: true }),
      ];
      expect(getSubjectAverage(bonusOn10)).toBeCloseTo(14, 6);

      const cappedAt20 = [makeGrade(18), makeGrade(16, { bonus: true })];
      expect(getSubjectAverage(cappedAt20)).toBe(20);
    });

    it("does not count bonus grades without any normal grade and evaluates optional against bonus-boosted avg", () => {
      const bonusOnly = [makeGrade(14, { bonus: true })];
      expect(getSubjectAverage(bonusOnly)).toBe(-1);
      expect(PapillonSubjectAvg(bonusOnly)).toBe(-1);
      expect(PapillonWeightedAvg(bonusOnly)).toBe(-1);

      // 10 + bonus 18 (+8) = 18; optional 14 (< 18) must not pull the average down.
      const bonusWithOptional = [
        makeGrade(10),
        makeGrade(18, { bonus: true }),
        makeGrade(14, { optional: true }),
      ];
      expect(getSubjectAverage(bonusWithOptional)).toBeCloseTo(18, 6);
      expect(PapillonWeightedAvg(bonusWithOptional)).toBeCloseTo(18, 6);
    });
  });

  describe("median with optional and bonus grades", () => {
    it("computes median on mandatory grades and greedily adds improving optional grades", () => {
      const dropLowerOptional = [
        makeGrade(10),
        makeGrade(14),
        makeGrade(6, { optional: true }),
      ];
      expect(PapillonMedian(dropLowerOptional)).toBeCloseTo(12, 6);

      const keepHigherOptional = [
        makeGrade(10),
        makeGrade(14),
        makeGrade(16, { optional: true }),
      ];
      expect(PapillonMedian(keepHigherOptional)).toBeCloseTo(14, 6);

      // Mandatory median = 12; sorted optional = [15, 13]. 15 -> 13.5, then 13 < 13.5 is skipped.
      const greedyMedian = [
        makeGrade(10),
        makeGrade(12),
        makeGrade(18),
        makeGrade(13, { optional: true }),
        makeGrade(15, { optional: true }),
      ];
      expect(PapillonMedian(greedyMedian)).toBeCloseTo(13.5, 6);

      // Mandatory median = 12; 16 -> 14, then 15 > 14 -> [10, 12, 15, 16, 18] -> 15.
      const cascadingMedian = [
        makeGrade(10),
        makeGrade(12),
        makeGrade(18),
        makeGrade(15, { optional: true }),
        makeGrade(16, { optional: true }),
      ];
      expect(PapillonMedian(cascadingMedian)).toBeCloseTo(15, 6);
    });

    it("ignores bonus grades and returns -1 when no mandatory grades exist", () => {
      const withBonus = [
        makeGrade(15),
        makeGrade(17),
        makeGrade(10, { bonus: true }),
      ];
      expect(PapillonMedian(withBonus)).toBeCloseTo(16, 6);

      expect(PapillonMedian([makeGrade(15, { optional: true })])).toBe(-1);
    });
  });
});
