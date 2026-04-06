import { GradeScore, GradeScoreKind } from "@/services/shared/grade";

const UNKNOWN_SCORE_STATUS = "Inconnu";

export function createMissingGradeScore(status: string = UNKNOWN_SCORE_STATUS): GradeScore {
  return {
    value: 0,
    disabled: true,
    status,
    kind: "missing"
  };
}

export function getGradeScoreKind(score?: GradeScore): GradeScoreKind {
  if (!score) {
    return "missing";
  }

  if (score.kind) {
    return score.kind;
  }

  if (score.disabled) {
    return score.status && score.status !== UNKNOWN_SCORE_STATUS
      ? "status"
      : "missing";
  }

  return "numeric";
}

export function isNumericGradeScore(score?: GradeScore): score is GradeScore {
  return !!score && !score.disabled && Number.isFinite(score.value);
}

export function isStatusGradeScore(score?: GradeScore): boolean {
  return getGradeScoreKind(score) === "status";
}

export function isMissingGradeScore(score?: GradeScore): boolean {
  return getGradeScoreKind(score) === "missing";
}

export function hasDisplayableGradeScore(score?: GradeScore): boolean {
  return !isMissingGradeScore(score);
}

export function formatGradeScore(score?: GradeScore, digits: number = 2): string | undefined {
  if (isNumericGradeScore(score)) {
    return score.value.toFixed(digits);
  }

  return score?.status;
}

export function getGradeScoreDenominator(score?: GradeScore, fallback?: number): number | undefined {
  if (!isNumericGradeScore(score)) {
    return undefined;
  }

  if (typeof score.outOf === "number" && Number.isFinite(score.outOf)) {
    return score.outOf;
  }

  return fallback;
}

export function isSameNumericScore(left?: GradeScore, right?: GradeScore): boolean {
  return isNumericGradeScore(left)
    && isNumericGradeScore(right)
    && left.value === right.value;
}
