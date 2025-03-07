import {
  updateGradesAndAveragesInCache,
  updateGradesPeriodsInCache,
} from "@/services/grades";
import { PrimaryAccount } from "@/stores/account/types";
import { useGradesStore } from "@/stores/grades";

export const getGrades = () => {
  return {
    defaultPeriod: useGradesStore.getState().defaultPeriod,
    grades: useGradesStore.getState().grades,
  };
};

export const updateGradeState = async (
  account: PrimaryAccount,
  period: string
) => {
  await updateGradesPeriodsInCache(account).then(
    async () => await updateGradesAndAveragesInCache(account, period)
  );
};
