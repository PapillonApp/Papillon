import { router } from "expo-router";

import {
  pendingPrepaLogins,
  type PrepaLogin,
} from "@/stores/account/pendingPrepaLogin";
import type { ServiceAccount } from "@/stores/account/types";

export function finishPrepaLogin(
  id: string,
  service: ServiceAccount,
  profile?: Parameters<PrepaLogin["add"]>[1]
) {
  if (pendingPrepaLogins.get(id)?.add(service, profile)) {
    router.dismissTo("/(onboarding)/prepa" as never);
  }
}
