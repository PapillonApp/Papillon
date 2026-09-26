import type { Itinerary, Leg } from "papillon-transport";

import type { SerializedItinerary, SerializedLeg } from "./types";

export function serialize(itineraries: Itinerary[]): SerializedItinerary[] {
  return itineraries.map((itinerary) => ({
    ...itinerary,
    departure: itinerary.departure.toISOString(),
    arrival: itinerary.arrival.toISOString(),
    legs: itinerary.legs.map(
      (leg) =>
        ({
          ...leg,
          departure: leg.departure.toISOString(),
          arrival: leg.arrival.toISOString(),
          scheduledDeparture: leg.scheduledDeparture.toISOString(),
          scheduledArrival: leg.scheduledArrival.toISOString(),
        }) as SerializedLeg,
    ),
  }));
}

function parse(value: unknown): Date | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revive(raw: unknown): Leg | undefined {
  if (typeof raw !== "object" || raw === null) {
    return undefined;
  }
  const leg = raw as Record<string, unknown>;
  const departure = parse(leg.departure);
  const arrival = parse(leg.arrival);
  const scheduledDeparture = parse(leg.scheduledDeparture);
  const scheduledArrival = parse(leg.scheduledArrival);
  if (!departure || !arrival || !scheduledDeparture || !scheduledArrival) {
    return undefined;
  }
  return { ...(leg as unknown as Leg), departure, arrival, scheduledDeparture, scheduledArrival };
}

export function deserialize(serialized: unknown): Itinerary[] | undefined {
  if (!Array.isArray(serialized)) {
    return undefined;
  }
  const result: Itinerary[] = [];
  for (const raw of serialized) {
    if (typeof raw !== "object" || raw === null) {
      return undefined;
    }
    const itinerary = raw as Record<string, unknown>;
    const departure = parse(itinerary.departure);
    const arrival = parse(itinerary.arrival);
    if (!departure || !arrival || !Array.isArray(itinerary.legs)) {
      return undefined;
    }
    const legs: Leg[] = [];
    for (const rawLeg of itinerary.legs) {
      const leg = revive(rawLeg);
      if (!leg) {
        return undefined;
      }
      legs.push(leg);
    }
    result.push({ ...(itinerary as unknown as Itinerary), departure, arrival, legs });
  }
  return result;
}
