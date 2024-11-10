import type { TurboselfAccount } from "@/stores/account/types";

export const getQRCode = async (account: TurboselfAccount): Promise<string | null> => {
  const cardNumber = account.authentication.session.host?.cardNumber;
  return cardNumber?.toString() ?? null;
};
