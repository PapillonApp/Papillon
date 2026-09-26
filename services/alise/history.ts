import { Client } from "alise-api";
import { CanteenHistoryItem } from "../shared/canteen";

export async function fetchAliseHistory(session: Client, accountId: string): Promise<CanteenHistoryItem[]> {
  try {
    const history = await session.getFinancialHistory();
    
    if (!history || !Array.isArray(history)) {
      console.warn("No financial history available or invalid format");
      return [];
    }
    
    const mappedHistory = history.map(event => ({
      date: event.date || new Date(),
      label: event.label || "Transaction sans libellé",
      currency: "€",
      amount: (event.amount || 0) * 100,
      createdByAccount: accountId
    }));
    
    const uniqueHistory = mappedHistory.filter((item, index, array) => {
      return array.findIndex(other => {
        const itemDay = new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate());
        const otherDay = new Date(other.date.getFullYear(), other.date.getMonth(), other.date.getDate());
        const sameDay = itemDay.getTime() === otherDay.getTime();
        
        const sameAmount = other.amount === item.amount;
        
        return sameDay && sameAmount;
      }) === index;
    });
    
    return uniqueHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
    
  } catch (error) {
    console.error("Error while retrieving Alise history:", error);
    return [];
  }
}
