import type { PlanResult } from "papillon-transport";

const pending = new Map<string, Promise<PlanResult>>();

export function dedupe(key: string, run: () => Promise<PlanResult>): Promise<PlanResult> {
  const existing = pending.get(key);
  if (existing) {
    return existing;
  }
  const promise = run().finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}
