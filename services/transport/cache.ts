import type { CommuteCacheEntry, CommuteDirection, DayKind, LatLon } from "./types";

function midnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function period(day: Date, now: Date): DayKind {
  const start = midnight(day);
  const today = midnight(now);
  if (start < today) {
    return "past";
  }
  return start === today ? "today" : "future";
}

function ymd(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

function point({ lat, lon }: LatLon): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

export function key(input: {
  accountId: string;
  direction: CommuteDirection;
  day: Date;
  from: LatLon;
  to: LatLon;
  time: Date;
}): string {
  return [
    input.accountId,
    input.direction,
    ymd(input.day),
    point(input.from),
    point(input.to),
    input.time.toISOString(),
  ].join("|");
}

export function fresh(fetchedAt: Date, now: Date, kind: DayKind): boolean {
  if (kind === "past") {
    return false;
  }
  // 15 min pour aujourd'hui, 6 h pour les jours suivants
  const ttl = kind === "today" ? 15 * 60_000 : 6 * 60 * 60_000;
  return now.getTime() - fetchedAt.getTime() < ttl;
}

function stamp(entry: CommuteCacheEntry): number {
  const time = Date.parse(entry.fetchedAt);
  return Number.isNaN(time) ? -Infinity : time;
}

export function put(
  entries: Record<string, CommuteCacheEntry>,
  id: string,
  entry: CommuteCacheEntry,
  max = 60,
): Record<string, CommuteCacheEntry> {
  const next = { ...entries, [id]: entry };
  const keys = Object.keys(next);
  if (keys.length <= max) {
    return next;
  }
  const oldest = keys.sort((a, b) => stamp(next[a]!) - stamp(next[b]!));
  for (const stale of oldest.slice(0, keys.length - max)) {
    delete next[stale];
  }
  return next;
}

export function prune(
  entries: Record<string, CommuteCacheEntry>,
  now: Date,
  maxAge = 24 * 60 * 60_000,
): Record<string, CommuteCacheEntry> {
  const limit = now.getTime() - maxAge;
  return Object.fromEntries(
    Object.entries(entries).filter(([, entry]) => stamp(entry) > limit),
  );
}
