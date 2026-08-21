
export interface GraphPoint {
  value: number;
  date: Date;
  originalValue?: number;
  originalDate?: Date;
}

export interface AverageHistoryItem {
  average: number;
  date: Date | string;
}

export const calculateAmplifiedGraphPoints = (
  currentAverageHistory: AverageHistoryItem[],
  scale: number
): GraphPoint[] => {
  if (!currentAverageHistory) { return []; }

  const points = currentAverageHistory
    .filter(item => !isNaN(item.average) && item.average !== null && item.average !== undefined)
    .map(item => ({
      value: item.average,
      date: new Date(item.date),
      originalValue: item.average,
      originalDate: new Date(item.date)
    }));

  if (points.length === 0) return [];

  const values = points.map(p => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const dataRange = dataMax - dataMin;

  const recentCount = Math.max(5, Math.floor(points.length * 0.5));
  const recentPoints = points.slice(-recentCount);
  const recentValues = recentPoints.map(p => p.value);
  const recentMin = Math.min(...recentValues);
  const recentMax = Math.max(...recentValues);
  const recentRange = recentMax - recentMin;
  const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

  const recentScaleUsage = (recentRange / scale) * 100;
  const globalScaleUsage = (dataRange / scale) * 100;

  const OUTLIER_THRESHOLD = 3;
  const compressedPoints = points.map(p => {
    const distanceFromRecent = Math.abs(p.value - recentMean);

    if (distanceFromRecent > OUTLIER_THRESHOLD) {
      const direction = p.value < recentMean ? -1 : 1;
      const excessDistance = distanceFromRecent - OUTLIER_THRESHOLD;
      const compressionFactor = 0.3;
      const compressedDistance = OUTLIER_THRESHOLD + (excessDistance * compressionFactor);

      return {
        ...p,
        value: recentMean + (direction * compressedDistance)
      };
    }
    return p;
  });

  const peakAmplifiedPoints = compressedPoints.map((p, i) => {
    const windowSize = 2;
    const start = Math.max(0, i - windowSize);
    const end = Math.min(compressedPoints.length - 1, i + windowSize);

    const neighbors = compressedPoints
      .slice(start, end + 1)
      .filter((_, idx) => start + idx !== i);

    if (neighbors.length === 0) return p;

    const neighborAvg = neighbors.reduce((sum, n) => sum + n.value, 0) / neighbors.length;
    const localDeviation = p.value - neighborAvg;

    const MIN_DEVIATION = 0.2;
    if (Math.abs(localDeviation) > MIN_DEVIATION) {
      const peakAmplification = 3.5;
      return {
        ...p,
        value: neighborAvg + (localDeviation * peakAmplification)
      };
    }
    return p;
  });

  const shouldAmplify = (globalScaleUsage < 30 || recentScaleUsage < 20) && dataRange > 0;
  let finalPoints = peakAmplifiedPoints;

  if (shouldAmplify) {
    const currentValues = peakAmplifiedPoints.map(p => p.value);
    const currentMin = Math.min(...currentValues);
    const currentMax = Math.max(...currentValues);

    const targetSpread = scale * 0.4;
    const currentSpread = currentMax - currentMin;

    if (currentSpread < targetSpread && currentSpread > 0) {
      const amplificationFactor = Math.min(4, targetSpread / currentSpread);

      finalPoints = peakAmplifiedPoints.map(p => ({
        ...p,
        value: recentMean + (p.value - recentMean) * amplificationFactor
      }));
    }
  }

  const firstDate = points[0].date.getTime();
  const DAY_MS = 86400000;
  const COMPRESSED_SPACING = DAY_MS * 0.50;

  return finalPoints.map((p, index) => ({
    ...p,
    value: Math.round(p.value * 100) / 100,
    date: new Date(firstDate + (index * COMPRESSED_SPACING))
  }));
};
