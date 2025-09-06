import { Auth } from "@/stores/account/types";
import { Balance } from "../shared/balance";
import { Client } from "pawrd";

export async function fetchArdBalance(
  session: Client,
  accountId: string,
  auth: Auth
): Promise<Balance[]> {
  const lunchPrice = Number(auth.additionals?.["mealPrice"] ?? 0)
  const payments = await session.getOnlinePayments();

  return payments.walletData.map(wallet => ({
    amount: wallet.walletAmount ?? 0,
    currency: "€",
    lunchRemaining: 0,
    lunchPrice,
    label: wallet.walletName ?? "Solde",
    createdByAccount: accountId,
  }));
}
