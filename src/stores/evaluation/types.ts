import type { Period } from "@/services/shared/Period";
import {Evaluation} from "@/services/shared/Evaluation";

export interface EvaluationStore {
  lastUpdated: number
  defaultPeriod: string
  periods: Period[]

  evaluations: { [periodName: string]: Evaluation[] }

  updatePeriods: (periods: Period[], defaultPeriodName: string) => void
  updateEvaluations: (periodName: string, evaluations: Evaluation[]) => void
}
