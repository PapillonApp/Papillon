import { Grade } from "@/services/shared/grade";

import {
  computeOverallSubjectAverage,
  computeWeightedAverageDetails,
  ScoreProperty,
} from "./helpers";

export const getSubjectAverage = (
  subject: Grade[],
  _loop: boolean = false,
  key: ScoreProperty = "studentScore"
): number => computeWeightedAverageDetails(subject, key, true).average;

const PapillonSubjectAvg = (
  grades: Grade[],
  key: ScoreProperty = "studentScore"
): number => computeOverallSubjectAverage(grades, key, -1);

export default PapillonSubjectAvg;
