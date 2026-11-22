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
  const flow = pendingPrepaLogins.get(id);
  if (flow?.add(service, profile)) {
    router.dismissTo(flow.returnTo as never);
  }
}
