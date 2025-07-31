import type { IzlyAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import * as ezly from "ezly";
import { operations } from "ezly";


export const balance = async (account: IzlyAccount): Promise<Balance[]> => {
  if (!account.instance) throw new ErrorServiceUnauthenticated("ARD");
  const balance = await ezly.balance(account.instance);
  const currency = account.authentication.configuration.currency;

  let remainingDividedBy = 0;

  try {
    const payments = await operations(
      account.instance!,
      ezly.OperationKind.Payment,
      5
    );

    const paysFullPrice = payments.filter((payment) => payment.amount === 3.30).length > 4;
    const paysBoursePrice = payments.filter((payment) => payment.amount === 1).length > 4;

    if (paysFullPrice) {
      remainingDividedBy = 3.30;
    } else if (paysBoursePrice) {
      remainingDividedBy = 1;
    }
  } catch (e) {
    console.error(e);
  }

  const remaining = remainingDividedBy > 0 ? Math.round(balance.value / remainingDividedBy) : null;

  return [{
    amount: balance.value,
    currency: currency,
    remaining: remaining,
    price: remainingDividedBy,
    label: "Self"
  },
  ...(balance.cashValue > 0 ? [{
    amount: balance.cashValue,
    currency: currency,
    remaining: remaining,
    price: remainingDividedBy,
    label: "Cash"
  }]: [])
  ];
};