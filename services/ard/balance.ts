import { Balance } from "../shared/balance";
import { Client } from "pawrd";

export async function fetchArdBalance(
  session: Client,
  accountId: string
): Promise<Balance[]> {
  const payments = await session.getOnlinePayments();

  return payments.walletData.map(wallet => ({
    amount: wallet.walletAmount ?? 0,
    currency: "€",
    lunchRemaining: 0,
    lunchPrice: 0,
    label: wallet.walletName ?? "Solde",
    createdByAccount: accountId,
  }));
}
