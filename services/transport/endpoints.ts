import type { TransportAddress, TransportStorage } from "@/stores/account/types";

import type { CommuteDirection, DayKind, LatLon } from "./types";

export type EndpointsResolution =
  | { kind: "ready"; from: LatLon; to: LatLon }
  | { kind: "needs_gps"; to: LatLon }
  | { kind: "needs_setup"; missing: "home" | "school" }
  | { kind: "hidden" };

export function current(address: TransportAddress | undefined): boolean {
  return address?.firstTitle === "current_location";
}

function coords(address: TransportAddress): LatLon {
  return { lat: address.latitude, lon: address.longitude };
}

export function endpoints(
  transport: TransportStorage,
  direction: CommuteDirection,
  dayKind: DayKind,
): EndpointsResolution {
  const { homeAddress, schoolAddress } = transport;
  if (!schoolAddress) {
    return { kind: "needs_setup", missing: "school" };
  }
  if (!homeAddress) {
    return { kind: "needs_setup", missing: "home" };
  }

  const school = coords(schoolAddress);

  if (current(homeAddress)) {
    if (direction === "return") {
      return { kind: "hidden" };
    }
    return dayKind === "today"
      ? { kind: "needs_gps", to: school }
      : { kind: "needs_setup", missing: "home" };
  }

  const home = coords(homeAddress);
  return direction === "departure"
    ? { kind: "ready", from: home, to: school }
    : { kind: "ready", from: school, to: home };
}
