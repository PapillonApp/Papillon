import type { Itinerary } from "papillon-transport";

import type { CommuteTarget, Selection } from "./types";

function order(a: Itinerary, b: Itinerary): number {
  return a.departure.getTime() - b.departure.getTime();
}

export function select(itineraries: Itinerary[], target: CommuteTarget, max = 3): Selection | null {
  const usable = itineraries.filter((itinerary) => !itinerary.cancelled).sort(order);
  if (usable.length === 0) {
    return null;
  }

  const limit = target.time.getTime();
  let chosen: Itinerary;
  let late = false;
  let lateMinutes = 0;

  if (target.direction === "departure") {
    const onTime = usable.filter((itinerary) => itinerary.arrival.getTime() <= limit);
    if (onTime.length > 0) {
      chosen = onTime[onTime.length - 1]!;
    } else {
      chosen = usable.reduce((best, candidate) =>
        candidate.arrival.getTime() < best.arrival.getTime() ? candidate : best,
      );
      late = true;
      lateMinutes = Math.ceil((chosen.arrival.getTime() - limit) / 60_000);
    }
  } else {
    chosen = usable.find((itinerary) => itinerary.departure.getTime() >= limit) ?? usable[0]!;
  }

  const alternatives = usable
    .filter((itinerary) => itinerary !== chosen)
    .sort(
      (a, b) =>
        Math.abs(a.departure.getTime() - chosen.departure.getTime()) -
        Math.abs(b.departure.getTime() - chosen.departure.getTime()),
    )
    .slice(0, max)
    .sort(order);

  return { itinerary: chosen, alternatives, late, lateMinutes };
}
