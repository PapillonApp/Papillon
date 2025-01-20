import type { AliseAccount } from "@/stores/account/types";

export const getQRCode = async (account: AliseAccount): Promise<Blob | null> => {
  const barcode = await account.authentication.session.getBarcode();
  return barcode ?? null;
};
