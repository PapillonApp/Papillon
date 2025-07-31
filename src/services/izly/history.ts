import type { IzlyAccount } from "@/stores/account/types";
import type { ReservationHistory } from "../shared/ReservationHistory";
import { operations, OperationKind} from "ezly";

export const history = async (account: IzlyAccount): Promise<ReservationHistory[]> => {
  const payments = await operations(account.instance!, OperationKind.Payment, 200);
  const topup = await operations(account.instance!, OperationKind.TopUp, 200);
  const currency = account.authentication.configuration.currency;

  return [
    ...(payments ?? []).map((item) => ({
      amount: item.isCredit ? item.amount : -item.amount,
      timestamp: item.date.getTime(),
      currency: currency,
      label: "Paiement"
    })),
    ...(topup ?? []).map((item) => ({
      amount: item.isCredit ? item.amount : -item.amount,
      timestamp: item.date.getTime(),
      currency: currency,
      label: "Rechargement"
    })),
  ];
};
