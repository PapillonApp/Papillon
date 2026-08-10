import { useAccountStore } from "@/stores/account";
import { initializeAccountManager } from "@/services/shared";

export async function initManager() {
  if (!useAccountStore.persist.hasHydrated()) {
    await new Promise<void>(resolve => {
      const unsub = useAccountStore.persist.onFinishHydration(() => {
        unsub();
        resolve();
      });
    });
  }

  const { lastUsedAccount, accounts } = useAccountStore.getState();
  if (!lastUsedAccount || !accounts.find(a => a.id === lastUsedAccount)) {
    return null;
  }

  return initializeAccountManager(lastUsedAccount);
}

export function parseDate(raw: unknown): Date {
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") return new Date(raw);
  if (typeof raw === "string") {
    // DD/MM/YYYY
    const ddmmyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      return new Date(
        Number(ddmmyyyy[3]),
        Number(ddmmyyyy[2]) - 1,
        Number(ddmmyyyy[1])
      );
    }
    return new Date(raw);
  }
  return new Date();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}