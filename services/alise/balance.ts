import { Client } from "alise-api";
import { Balance } from "../shared/balance";
import { detectMealPrice } from "@/utils/restaurant/detect-price";

export async function fetchAliseBalance(session: Client, accountId: string): Promise<Balance[]> {
  try {
    const account = await session.getInformations();
    
    if (!account) {
      console.warn("Aucune information de compte disponible");
      return [];
    }
    
    let mealPrice = 0;
    let lunchRemaining = 0;
    
    try {
      const history = await session.getFinancialHistory();
      if (history && Array.isArray(history)) {
        const mappedHistory = history.map(event => ({
          date: event.date,
          label: event.label,
          currency: "€",
          amount: event.amount * 100,
          createdByAccount: accountId
        }));
        
        const detectedPrice = detectMealPrice(mappedHistory);
        if (detectedPrice && detectedPrice > 0) {
          mealPrice = detectedPrice;
          lunchRemaining = Math.floor((account.balance * 100) / mealPrice);
        }
      }
    } catch (error) {
      console.warn("Erreur lors de la détection du prix des repas:", error);
    }
    
    return [{
      amount: account.balance * 100,
      currency: "€",
      lunchRemaining: lunchRemaining,
      lunchPrice: mealPrice,
      label: account.establishment || "Établissement",
      createdByAccount: accountId
    }];
  } catch (error) {
    console.error("Erreur lors de la récupération du solde Alise:", error);
    return [];
  }
}
