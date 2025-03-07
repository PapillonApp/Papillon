import {
  updateEvaluationPeriodsInCache,
  updateEvaluationsInCache,
} from "@/services/evaluation";
import { PrimaryAccount } from "@/stores/account/types";
import { useEvaluationStore } from "@/stores/evaluation";

export const getEvaluation = () => {
  return {
    defaultPeriod: useEvaluationStore.getState().defaultPeriod,
    evaluation: useEvaluationStore.getState().evaluations,
  };
};

export const updateEvaluationState = async (
  account: PrimaryAccount,
  period: string
) => {
  await updateEvaluationPeriodsInCache(account).then(
    async () => await updateEvaluationsInCache(account, period)
  );
};
