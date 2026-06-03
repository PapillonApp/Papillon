export type GradeDisplayScale = "20" | "10" | "5" | "percentage";

export const DEFAULT_GRADE_DISPLAY_SCALE: GradeDisplayScale = "20";

export const getGradeDisplayScale = (
  value?: string,
): GradeDisplayScale => {
  if (value === "10" || value === "5" || value === "percentage" || value === "20") {
    return value;
  }

  return DEFAULT_GRADE_DISPLAY_SCALE;
};

export const getDisplayScaleMax = (scale: GradeDisplayScale): number => {
  if (scale === "percentage") {
    return 100;
  }

  return Number(scale);
};

export const toDisplayScaleFrom20 = (value: number, scale: GradeDisplayScale): number => {
  if (scale === "percentage") {
    return (value / 20) * 100;
  }

  return (value / 20) * Number(scale);
};

export const getDisplayDenominator = (scale: GradeDisplayScale): string => {
  if (scale === "percentage") {
    return "%";
  }

  return `/${scale}`;
};

export const formatAssumed20ForDisplay = (
  value: number,
  scale: GradeDisplayScale,
): { value: number; denominator: string } => {
  return {
    value: toDisplayScaleFrom20(value, scale),
    denominator: getDisplayDenominator(scale),
  };
};

export const formatScoreForDisplay = (
  value: number,
  outOf: number,
  scale: GradeDisplayScale,
): { value: number; denominator: string } => {
  if (outOf === 20) {
    return formatAssumed20ForDisplay(value, scale);
  }

  return {
    value,
    denominator: `/${outOf}`,
  };
};
