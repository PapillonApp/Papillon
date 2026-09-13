import { useEffect } from "react";

import type { AccountManager } from "@/services/shared";
import { subscribeManagerUpdate } from "@/services/shared";

/**
 * How long a screen waits for the account manager before giving up on it.
 * `subscribeManagerUpdate` only fires once a manager exists, so an
 * initialization that threw (expired session, no network on a cold start)
 * would otherwise leave every subscriber waiting forever.
 */
export const MANAGER_TIMEOUT_MS = 15_000;

/**
 * Subscribes to the account manager and guarantees an outcome: either
 * `onManager` runs, or `onUnavailable` does once the wait times out. Both
 * callbacks must be stable (`useCallback`), as they drive the subscription.
 */
export function useManagerSubscription(
  onManager: (manager: AccountManager) => void,
  onUnavailable?: () => void
) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let received = false;

    const unsubscribe = subscribeManagerUpdate(manager => {
      if (!manager) { return; }
      received = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      onManager(manager);
    });

    if (!received && onUnavailable) {
      timer = setTimeout(() => {
        timer = null;
        onUnavailable();
      }, MANAGER_TIMEOUT_MS);
    }

    return () => {
      if (timer) { clearTimeout(timer); }
      unsubscribe();
    };
  }, [onManager, onUnavailable]);
}
