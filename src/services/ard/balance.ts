import type { ARDAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";
import { ErrorServiceUnauthenticated } from "../shared/errors";

export const balance = async (account: ARDAccount): Promise<Balance[]> => {
  if (!account.instance) throw new ErrorServiceUnauthenticated("ARD");
  const payments = await account.instance!.getOnlinePayments();

  return payments.walletData.map(wallet => ({
    amount: wallet.walletAmount / 100,
    currency: "€",
    remaining: null,
    label: wallet.walletName
  }));

};