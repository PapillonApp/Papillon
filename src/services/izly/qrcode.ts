import type { IzlyAccount } from "@/stores/account/types";
import {qrPay} from "ezly";

export const getQRCode = async (account: IzlyAccount): Promise<string | null> => {
  const cardNumber = qrPay(account.instance!);
  return cardNumber ?? null;
};
