import type { ARDAccount } from "@/stores/account/types";
import type { ReservationHistory } from "../shared/ReservationHistory";

export const history = async (account: ARDAccount): Promise<ReservationHistory[]> => {
  const uid = await account.instance?.getOnlinePayments().then((payments) => payments.user.uid);
  if (!uid) throw new Error("We can't get the account UID");

  let [financialHistory, ordersHistory, consumptionsHistory] = await Promise.all([
    account.instance?.getFinancialHistory(uid),
    account.instance?.getOrdersHistory(uid),
    account.instance?.getConsumptionsHistory(uid)
  ]);

  return [
    ...(financialHistory ?? []).map((item) => ({
      amount: ((item.credit ?? 0) - (item.debit ?? 0)) / 100,
      timestamp: item.operationDate * 1000,
      currency: "€",
      label: item.operationName
    })),
    ...(ordersHistory ?? []).map((item) => ({
      amount: item.amount / 100,
      timestamp: item.orderDate * 1000,
      currency: "€",
      label: "Transaction n°" + item.orderReference.toString()
    })),
    ...(consumptionsHistory ?? []).map((item) => ({
      amount: -item.amount / 100,
      timestamp: item.consumptionDate * 1000,
      currency: "€",
      label: item.consumptionDescription
    }))
  ];
};
