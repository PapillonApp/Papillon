import type { AliseAccount } from "@/stores/account/types";
import type { ReservationHistory } from "../shared/ReservationHistory";

export const getHistory = async (account: AliseAccount): Promise<ReservationHistory[]> => {
  const history = await account.authentication.session.getFinancialHistory();
  return (history ?? []).map((item) => ({
    timestamp: item.date.getTime(),
    amount: item.amount,
    currency: "€",
    label: item.label,
  }));
};
