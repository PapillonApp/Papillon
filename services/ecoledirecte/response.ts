/** Returns a list from either a bare array or the common API response wrappers. */
export function getResponseArray<T>(value: unknown, keys: string[]): T[] {
  const visit = (current: unknown, depth: number, seen: Set<object>): T[] => {
    if (Array.isArray(current)) {
      return current.filter(item => item != null) as T[];
    }

    if (!current || typeof current !== "object" || depth >= 6 || seen.has(current)) return [];
    seen.add(current);

    const record = current as Record<string, unknown>;
    for (const key of keys) {
      const candidate = record[key];
      if (Array.isArray(candidate)) return candidate.filter(item => item != null) as T[];
    }
    for (const key of keys) {
      const candidate = record[key];
      if (candidate && typeof candidate === "object") {
        const result = visit(candidate, depth + 1, seen);
        if (result.length > 0) return result;
      }
    }
    return [];
  };
  return visit(value, 0, new Set<object>());
}
