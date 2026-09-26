import type { Itinerary, Line, PlaceKind } from "papillon-transport";

import { minutes } from "./format";

export type ItineraryStep =
  | { kind: "walk"; minutes: number; toName?: string; toKind: PlaceKind; isTransfer: boolean }
  | {
      kind: "transit";
      line: Line;
      headsign?: string;
      fromName?: string;
      toName?: string;
      departure: Date;
      arrival: Date;
      stopCount: number;
      delayMinutes: number;
      realtime: boolean;
      cancelled: boolean;
    };

export function steps(itinerary: Itinerary): ItineraryStep[] {
  const { legs } = itinerary;
  const list: ItineraryStep[] = [];

  legs.forEach((leg, index) => {
    if (leg.type === "walk") {
      if (leg.durationSeconds <= 0) {
        return;
      }
      const previousIsTransit = legs.slice(0, index).some(l => l.type === "transit");
      const nextIsTransit = legs.slice(index + 1).some(l => l.type === "transit");
      list.push({
        kind: "walk",
        minutes: minutes(leg.durationSeconds),
        toName: leg.to.name,
        toKind: leg.to.kind,
        isTransfer: previousIsTransit && nextIsTransit,
      });
      return;
    }

    list.push({
      kind: "transit",
      line: leg.line,
      headsign: leg.headsign,
      fromName: leg.from.name,
      toName: leg.to.name,
      departure: leg.departure,
      arrival: leg.arrival,
      stopCount: leg.intermediateStopCount,
      delayMinutes: Math.round((leg.departure.getTime() - leg.scheduledDeparture.getTime()) / 60_000),
      realtime: leg.realtime,
      cancelled: leg.cancelled,
    });
  });

  return list;
}
