import { Grade } from "@/services/shared/grade";

import { normalizeValidGrade } from "./helpers";

const computeMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

const PapillonMedian = (grades: Grade[]): number => {
  const mandatoryValues: number[] = [];
  const optionalValues: number[] = [];

  for (const grade of grades) {
    const normalized = normalizeValidGrade(grade, "studentScore");
    if (!normalized || normalized.bonus) {
      continue;
    }

    if (normalized.optional) {
      optionalValues.push(normalized.gradeOn20);
    } else {
      mandatoryValues.push(normalized.gradeOn20);
    }
  }

  if (mandatoryValues.length === 0) {
    return -1;
  }

  const activeValues = [...mandatoryValues];
  let currentMedian = computeMedian(activeValues);
  const sortedOptional = [...optionalValues].sort((a, b) => b - a);

  for (const optionalValue of sortedOptional) {
    if (optionalValue > currentMedian) {
      activeValues.push(optionalValue);
      currentMedian = computeMedian(activeValues);
    }
  }

  return currentMedian;
};

export default PapillonMedian;
