import { type Account, AccountService } from "@/stores/account/types";
import { Menu } from "pawnote";

export async function getMenu <T extends Account> (account: Account, date: Date): Promise<Menu> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getMenu } = await import("./pronote/menu");
      const menu = await getMenu(account, date);
      return menu;
    }
    default: {
      throw new Error("Service not implemented.");
    }
  }
}