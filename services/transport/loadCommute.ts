import { isTransportError, type Itinerary, type PlanQuery, type PlanResult } from "papillon-transport";

import type { Course } from "@/services/shared/timetable";
import type { TransportStorage } from "@/stores/account/types";

import { fresh, key, period } from "./cache";
import { endpoints } from "./endpoints";
import { classify, policy } from "./errors";
import { dedupe } from "./inflight";
import { select } from "./select";
import { deserialize, serialize } from "./serialize";
import { margin, target } from "./target";
import type {
  CommuteCacheEntry,
  CommuteDirection,
  CommuteState,
  CommuteTarget,
  LatLon,
} from "./types";

export interface LoadCommuteDeps {
  now: Date;
  accountId: string;
  day: Date;
  courses: Course[];
  direction: CommuteDirection;
  transport: TransportStorage | undefined;
  force: boolean;
  getCachedEntry(key: string): CommuteCacheEntry | undefined;
  putCachedEntry(key: string, entry: CommuteCacheEntry): void;
  blockedUntil: Date | undefined;
  setBlockedUntil(date: Date): void;
  getLocationPermission(): Promise<"granted" | "denied">;
  getCurrentPosition(): Promise<LatLon>;
  plan(query: PlanQuery): Promise<PlanResult>;
  onLoading(): void;
  log(level: "warn" | "error", message: string): void;
}

function ready(
  cacheKey: string,
  itineraries: Itinerary[],
  goal: CommuteTarget,
  fetchedAt: Date,
  stale: boolean,
): CommuteState {
  const selection = select(itineraries, goal);
  return selection
    ? { kind: "ready", cacheKey, selection, fetchedAt, stale }
    : { kind: "empty" };
}

export async function load(deps: LoadCommuteDeps): Promise<CommuteState | null> {
  const { transport, now } = deps;
  if (!transport?.enabled) {
    return { kind: "hidden" };
  }

  const dayKind = period(deps.day, now);
  if (dayKind === "past") {
    return { kind: "hidden" };
  }

  const goal = target(deps.courses, deps.direction, margin(transport));
  if (!goal) {
    return { kind: "hidden" };
  }

  const ends = endpoints(transport, deps.direction, dayKind);
  if (ends.kind === "hidden" || ends.kind === "needs_setup") {
    return ends;
  }

  let from: LatLon;
  const to = ends.to;
  if (ends.kind === "needs_gps") {
    deps.onLoading();
    if ((await deps.getLocationPermission()) === "denied") {
      return { kind: "permission_denied" };
    }
    try {
      from = await deps.getCurrentPosition();
    } catch (error) {
      deps.log("warn", `Commute: current position unavailable (${String(error)})`);
      return { kind: "error", code: "LOCATION_UNAVAILABLE" };
    }
  } else {
    from = ends.from;
  }

  const cacheKey = key({
    accountId: deps.accountId,
    direction: deps.direction,
    day: deps.day,
    from,
    to,
    time: goal.time,
  });

  const entry = deps.getCachedEntry(cacheKey);
  const cachedItineraries = entry ? deserialize(entry.itineraries) : undefined;
  const cachedAt = entry ? new Date(entry.fetchedAt) : undefined;
  const hasCache = cachedItineraries !== undefined && cachedAt !== undefined && !Number.isNaN(cachedAt.getTime());

  if (hasCache && !deps.force && fresh(cachedAt, now, dayKind)) {
    return ready(cacheKey, cachedItineraries, goal, cachedAt, false);
  }

  if (deps.blockedUntil && deps.blockedUntil.getTime() > now.getTime()) {
    return hasCache
      ? ready(cacheKey, cachedItineraries, goal, cachedAt, true)
      : { kind: "error", code: "RATE_LIMITED" };
  }

  deps.onLoading();
  try {
    const result = await dedupe(cacheKey, () =>
      deps.plan({
        from,
        to,
        time: goal.time,
        arriveBy: goal.arriveBy,
        maxItineraries: 5,
        includeGeometry: true,
      }),
    );
    deps.putCachedEntry(cacheKey, {
      fetchedAt: now.toISOString(),
      itineraries: serialize(result.itineraries),
    });
    return ready(cacheKey, result.itineraries, goal, now, false);
  } catch (error) {
    const code = classify(error);
    if (code === "RATE_LIMITED") {
      const seconds =
        (isTransportError(error) ? error.retryAfterSeconds : undefined) ?? 300;
      deps.setBlockedUntil(new Date(now.getTime() + seconds * 1000));
    }

    const rule = policy(code);
    if (rule.log !== "none") {
      deps.log(rule.log, `Commute: ${code} (${String(error)})`);
    }

    switch (rule.display) {
    case "ignore":
      return null;
    case "hidden":
      return { kind: "hidden" };
    case "stale_or_error":
      return hasCache
        ? ready(cacheKey, cachedItineraries, goal, cachedAt, true)
        : { kind: "error", code };
    case "error":
    default:
      return { kind: "error", code };
    }
  }
}
