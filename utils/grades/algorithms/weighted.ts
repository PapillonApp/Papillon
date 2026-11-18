import { Grade } from "@/services/shared/grade";

import { computeWeightedAverageDetails, ScoreProperty } from "./helpers";

const PapillonWeightedAvg = (
  grades: Grade[],
  key: ScoreProperty = "studentScore"
): number => computeWeightedAverageDetails(grades, key, false).average;

export default PapillonWeightedAvg;
