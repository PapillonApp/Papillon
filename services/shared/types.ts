import { Services } from "@/stores/account/types";

export interface SchoolServicePlugin {
  displayName: string;
  service: Services;

  refreshAccount: (accountId: string) => Promise<void>;
}