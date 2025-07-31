import { Balance } from "@/services/shared/Balance";
import { ReservationHistory } from "@/services/shared/ReservationHistory";
import { Account, AccountService } from "@/stores/account/types";
import { StoreTheme } from "@/views/account/Restaurant/Cards/StoreThemes";

export const formatCardIdentifier = (
  identifier: string,
  dots: number = 4,
  separator: string = " "
) => {
  if (!identifier) {
    return "";
  }

  const visiblePart = identifier.slice(-4).toLowerCase();
  const maskedPart = identifier.slice(-(4 + dots), -4).replace(/./g, "•");
  return (
    maskedPart + separator + (visiblePart.match(/.{1,4}/g) ?? []).join(" ")
  );
};

export interface ServiceCard {
  service: string | AccountService;
  account: Account | null;
  identifier: string;
  balance: never[] | Balance[];
  history: never[] | ReservationHistory[];
  cardnumber: string | Blob | null;
  theme: StoreTheme;
}
