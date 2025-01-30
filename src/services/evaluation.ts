import { type Account, AccountService } from "@/stores/account/types";
import type { Period } from "./shared/Period";
import {getFeatureAccount} from "@/utils/multiservice";
import {MultiServiceFeature} from "@/stores/multiService/types";
import { useEvaluationStore } from "@/stores/evaluation";
import { Evaluation } from "@/services/shared/Evaluation";
import { error, log } from "@/utils/logger/logger";

const getDefaultPeriod = (periods: Period[]): string => {
  const now = Date.now();
  const currentPeriod = periods.find((p) => p.startTimestamp &&p.endTimestamp && p.startTimestamp <= now && p.endTimestamp >= now) || periods.at(0) ;
  return currentPeriod!.name;
};

export async function updateEvaluationPeriodsInCache <T extends Account> (account: T): Promise<void> {
  let periods: Period[] = [];
  let defaultPeriod: string|null = null;

  switch (account.service) {
    case AccountService.Pronote: {
      const { getEvaluationsPeriods } = await import("./pronote/evaluations");
      const output = getEvaluationsPeriods(account);

      periods = output.periods;
      defaultPeriod = output.default;

      break;
    }
    case AccountService.PapillonMultiService: {
      const service = getFeatureAccount(MultiServiceFeature.Evaluations, account.localID);
      if (!service) {
        log("No service set in multi-service space for feature \"Evaluations\"", "multiservice");
        break;
      }
      return await updateEvaluationPeriodsInCache(service);
    }
    default:
      throw new Error("Service not implemented");
  }
  if(periods.length === 0) return;
  if(!defaultPeriod) defaultPeriod = getDefaultPeriod(periods);
  useEvaluationStore.getState().updatePeriods(periods, defaultPeriod);
}

export async function updateEvaluationsInCache <T extends Account> (account: T, periodName: string): Promise<void> {
  let evaluations: Evaluation[] = [];
  try {
    switch (account.service) {
      case AccountService.Pronote: {
        const { getEvaluations } = await import("./pronote/evaluations");
        evaluations = await getEvaluations(account, periodName);
        break;
      }
      case AccountService.PapillonMultiService: {
        const service = getFeatureAccount(MultiServiceFeature.Evaluations, account.localID);
        if (!service) {
          log("No service set in multi-service space for feature \"Evaluations\"", "multiservice");
          break;
        }
        return await updateEvaluationsInCache(service, periodName);
      }
      default:
        throw new Error(`Service (${AccountService[account.service]}) not implemented for this request`);
    }
    useEvaluationStore.getState().updateEvaluations(periodName, evaluations);
  }
  catch (err) {
    error(`evaluations not updated, see:${err}`, "updateGradesAndAveragesInCache");
  }
}
