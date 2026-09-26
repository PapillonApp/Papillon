import { CanteenHistoryItem } from "@/services/shared/canteen";

export function detectMealPrice (history: CanteenHistoryItem[]): number | null {
  let mostFrequentAmount: number = 0;
  let maxCount = 0;
  const amountCount: Record<number, number> = {};

  for (const consumption of history) {
    if (consumption.amount < 0) {
      const amount = consumption.amount * -1;
      
      if (amount >= 50 && amount <= 2000) {
        amountCount[amount] = (amountCount[amount] || 0) + 1;

        if (amountCount[amount] > maxCount) {
          maxCount = amountCount[amount];
          mostFrequentAmount = amount;
        }
      }
    }
  }
  
  return maxCount > 0 ? mostFrequentAmount : null;
}