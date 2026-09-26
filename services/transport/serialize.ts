import type { Itinerary, Leg } from "papillon-transport";

import type { SerializedItinerary, SerializedLeg } from "./types";

export function serialize(itineraries: Itinerary[]): SerializedItinerary[] {
  return itineraries.map(itinerary => ({
    ...itinerary,
    departure: itinerary.departure.toISOString(),
    arrival: itinerary.arrival.toISOString(),
    legs: itinerary.legs.map(leg => ({
      ...leg,
      departure: leg.departure.toISOString(),
      arrival: leg.arrival.toISOString(),
      scheduledDeparture: leg.scheduledDeparture.toISOString(),
      scheduledArrival: leg.scheduledArrival.toISOString(),
    })),
  }));
}

function parse(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revive(leg: SerializedLeg): Leg | undefined {
  const departure = parse(leg.departure);
  const arrival = parse(leg.arrival);
  const scheduledDeparture = parse(leg.scheduledDeparture);
  const scheduledArrival = parse(leg.scheduledArrival);
  if (!departure || !arrival || !scheduledDeparture || !scheduledArrival) {
    return undefined;
  }
  return { ...leg, departure, arrival, scheduledDeparture, scheduledArrival };
}

export function deserialize(serialized: SerializedItinerary[] | undefined): Itinerary[] | undefined {
  if (!serialized) {
    return undefined;
  }
  const result: Itinerary[] = [];
  for (const itinerary of serialized) {
    const departure = parse(itinerary.departure);
    const arrival = parse(itinerary.arrival);
    if (!departure || !arrival) {
      return undefined;
    }
    const legs: Leg[] = [];
    for (const serializedLeg of itinerary.legs) {
      const leg = revive(serializedLeg);
      if (!leg) {
        return undefined;
      }
      legs.push(leg);
    }
    result.push({ ...itinerary, departure, arrival, legs });
  }
  return result;
}
