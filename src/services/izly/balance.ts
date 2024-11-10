import type { IzlyAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import * as ezly from "ezly";

export const balance = async (account: IzlyAccount): Promise<Balance[]> => {
  if (!account.instance) throw new ErrorServiceUnauthenticated("ARD");
  const balance = await ezly.balance(account.instance);
  const currency = account.authentication.configuration.currency;

  return [{
    amount: balance.value,
    currency: currency,
    remaining: null,
    label: "Self"
  },
  ...(balance.cashValue > 0 ? [{
    amount: balance.cashValue,
    currency: currency,
    remaining: null,
    label: "Cash"
  }]: [])
  ];
};