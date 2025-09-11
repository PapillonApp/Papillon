import { balance, Identification, OperationKind, operations } from "ezly";
import { Balance } from "../shared/balance";

export async function fetchIzlyBalances(accountId: string, session: Identification): Promise<Balance[]> {
  const fetchedBalance = await balance(session);
  const payments = await operations(session, OperationKind.Payment)
  
  const paysFullPrice = payments.filter((payment) => payment.amount === 3.30).length > 4;

  const mealPrice = (paysFullPrice ? 3.30 : 1) * 100;
  const remainingMeal = Math.floor(fetchedBalance.value / (mealPrice));
  
  return [
    {
      amount: fetchedBalance.value * 100,
      currency: "€",
      lunchRemaining: remainingMeal,
      lunchPrice: mealPrice,
      label: "Self",
      createdByAccount: accountId
    },
    ...(fetchedBalance.cashValue > 0
      ? [{
          amount: fetchedBalance.cashValue * 100,
          currency: "€",
          lunchRemaining: remainingMeal,
          lunchPrice: mealPrice,
          label: "Cash",
          createdByAccount: accountId
        }]
      : [])
  ];
}