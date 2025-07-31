import { type Account, AccountService } from "@/stores/account/types";
import { Menu } from "./shared/Menu";

export async function getMenu <T extends Account> (account: Account, date: Date): Promise<Menu | null> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getMenu } = await import("./pronote/menu");
      const menu = await getMenu(account, date);
      return menu;
    }
    case AccountService.Alise: {
      const { getMenu } = await import("./alise/menu");
      const menu = await getMenu(account, date);
      return menu;
    }
    default: {
      return null;
    }
  }
}