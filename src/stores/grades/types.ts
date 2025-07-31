import type { Grade, AverageOverview } from "@/services/shared/Grade";
import type { Period } from "@/services/shared/Period";
import type { Reel } from "@/services/shared/Reel";

export interface GradesStore {
  lastUpdated: number
  defaultPeriod: string
  periods: Period[]

  grades: { [periodName: string]: Grade[] }
  averages: { [periodName: string]: AverageOverview }
  reels: { [gradeID: string]: Reel }

  updatePeriods: (periods: Period[], defaultPeriodName: string) => void
  updateGradesAndAverages: (periodName: string, grades: Grade[], averages: AverageOverview) => void
}
