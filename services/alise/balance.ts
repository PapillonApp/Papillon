import { Client } from "alise-api";

import { detectMealPrice } from "@/utils/restaurant/detect-price";

import { Balance } from "../shared/balance";

export async function fetchAliseBalance(session: Client, accountId: string): Promise<Balance[]> {
  try {
    const account = await session.getInformations();
    
    if (!account) {
      console.warn("No account information available");
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
        } else {
          mealPrice = 0;
          lunchRemaining = 0;
        }
      }
    } catch (error) {
      console.warn("Error while detecting meal prices:", error);
    }
    
    return [{
      amount: account.balance * 100,
      currency: "€",
      lunchRemaining: lunchRemaining,
      lunchPrice: mealPrice,
      label: "Solde",
      createdByAccount: accountId
    }];
  } catch (error) {
    console.error("Error retrieving Alise balance:", error);
    return [];
  }
}
