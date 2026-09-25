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

/** Returns a list when the response contains one, including a valid empty list. */
export function requireResponseArray<T>(value: unknown, keys: string[], source: string): T[] {
  if (!hasResponseArray(value, keys)) {
    throw new TypeError(`${source} did not contain an array response.`);
  }
  return getResponseArray<T>(value, keys);
}

function hasResponseArray(value: unknown, keys: string[]): boolean {
  const visit = (current: unknown, depth: number, seen: Set<object>): boolean => {
    if (Array.isArray(current)) return true;
    if (!current || typeof current !== "object" || depth >= 6 || seen.has(current)) return false;
    seen.add(current);

    const record = current as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(record[key])) return true;
    }
    for (const key of keys) {
      const candidate = record[key];
      if (candidate && typeof candidate === "object" && visit(candidate, depth + 1, seen)) return true;
    }
    return false;
  };
  return visit(value, 0, new Set<object>());
}
