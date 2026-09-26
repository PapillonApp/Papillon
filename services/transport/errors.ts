import { isTransportError } from "papillon-transport";

import type { CommuteErrorCode } from "./types";

export class LocationUnavailableError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("Current position unavailable");
    this.name = "LocationUnavailableError";
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function classify(error: unknown): CommuteErrorCode {
  if (isTransportError(error)) {
    return error.code;
  }
  if (error instanceof LocationUnavailableError) {
    return "LOCATION_UNAVAILABLE";
  }
  return "UNKNOWN";
}

export interface ErrorPolicy {
  display: "stale_or_error" | "error" | "hidden" | "ignore";
  log: "none" | "warn" | "error";
}

export function policy(code: CommuteErrorCode): ErrorPolicy {
  switch (code) {
  case "NETWORK":
  case "TIMEOUT":
  case "RATE_LIMITED":
    return { display: "stale_or_error", log: "none" };
  case "INVALID_QUERY":
  case "INVALID_CONFIG":
    return { display: "hidden", log: "error" };
  case "ABORTED":
    return { display: "ignore", log: "none" };
  case "HTTP":
  case "INVALID_RESPONSE":
  case "LOCATION_UNAVAILABLE":
  case "UNKNOWN":
  default:
    return { display: "error", log: "warn" };
  }
}
