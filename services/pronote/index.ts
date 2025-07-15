import { SchoolServicePlugin } from "@/services/shared/types";
import { Services } from "@/stores/account/types";

export class Pronote implements SchoolServicePlugin {
  displayName = "PRONOTE";
  service = Services.PRONOTE;

  async refreshAccount(accountId: string): Promise<void> {
    // TODO: Implementation for refreshing the PRONOTE account
    console.log(`Refreshing PRONOTE account with ID: ${accountId}`);
  }
}
