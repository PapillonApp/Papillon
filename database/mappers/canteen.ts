import CanteenMenu from "@/database/models/CanteenMenu";
import { CanteenMenu as SharedCanteenMenu } from "@/services/shared/canteen";

export function mapCanteenMenuToShared(menu: CanteenMenu): SharedCanteenMenu {
  return {
    date: new Date(menu.date),
    lunch: menu.lunch,
    dinner: menu.dinner,
    createdByAccount: menu.createdByAccount
  }
}