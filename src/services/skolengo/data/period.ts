import { ErrorServiceUnauthenticated } from "@/services/shared/errors";
import { SkolengoAccount } from "@/stores/account/types";

export const getPeriod = async (account: SkolengoAccount) => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("skolengo");

  const periods = await account.instance.getEvaluationSettings();

  return periods.map(e=>e.periods).flat().map((p) => ({
    id: p.id,
    name: p.label,
    startTimestamp: new Date(p.startDate).getTime(),
    endTimestamp: new Date(p.endDate).getTime(),
  }));
};