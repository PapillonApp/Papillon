import type { TurboselfAccount } from "@/stores/account/types";

export const getQRCode = async (account: TurboselfAccount): Promise<number> => {
  const cardNumber = await account.authentication.session.host?.cardNumber;
  return cardNumber ?? 0;
};
