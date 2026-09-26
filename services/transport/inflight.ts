const pending = new Map<string, Promise<unknown>>();

export function dedupe<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = pending.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }
  const promise = run().finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}
