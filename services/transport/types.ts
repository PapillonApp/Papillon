import type { Itinerary, Leg, TransitLeg, TransportErrorCode, WalkLeg } from "papillon-transport";

import type { Course } from "@/services/shared/timetable";

export type CommuteDirection = "departure" | "return";

export type DayKind = "past" | "today" | "future";

export interface LatLon {
  lat: number;
  lon: number;
}

export interface CommuteTarget {
  direction: CommuteDirection;
  course: Course;
  time: Date;
  arriveBy: boolean;
  marginMinutes: number;
}

export interface Selection {
  itinerary: Itinerary;
  alternatives: Itinerary[];
  late: boolean;
  lateMinutes: number;
}

export type CommuteErrorCode = TransportErrorCode | "LOCATION_UNAVAILABLE" | "UNKNOWN";

export type CommuteState =
  | { kind: "hidden" }
  | { kind: "needs_setup"; missing: "home" | "school" }
  | { kind: "permission_denied" }
  | { kind: "loading" }
  | { kind: "ready"; cacheKey: string; selection: Selection; fetchedAt: Date; stale: boolean }
  | { kind: "empty" }
  | { kind: "error"; code: CommuteErrorCode };

type DatesAsStrings<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type SerializedLeg = DatesAsStrings<WalkLeg> | DatesAsStrings<TransitLeg>;

export type SerializedItinerary = Omit<DatesAsStrings<Itinerary>, "legs"> & {
  legs: SerializedLeg[];
};

export interface CommuteCacheEntry {
  fetchedAt: string;
  itineraries: SerializedItinerary[];
}

export type { Leg };
