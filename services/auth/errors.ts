import { AuthErrorClassifier, AuthFailure, AuthFailureReason } from "./types";

/** The stored credentials lack what a login needs: only a relink can fill them. */
export class CredentialsMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CredentialsMissingError";
  }
}

/**
 * Thrown before any request: an earlier failure in this launch still holds
 * (backoff, suspension or rejected credential).
 */
export class AuthOnHoldError extends Error {
  constructor(public serviceId: string, public failure: AuthFailure, public retryAt?: number) {
    super(
      retryAt
        ? `Authentication of ${serviceId} is paused for ${Math.ceil((retryAt - Date.now()) / 1000)}s after: ${failure.message}`
        : `Authentication of ${serviceId} is blocked until the account is linked again: ${failure.message}`
    );
    this.name = "AuthOnHoldError";
  }
}

const NETWORK_MESSAGE = /network request failed|failed to fetch|fetch failed|timed? ?out|ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|aborted/i;

/** The coordinator's own errors, then the service's classifier, then the rules shared by every service. */
export const classifyAuthError = (e: unknown, classify?: AuthErrorClassifier): AuthFailureReason => {
  if (e instanceof AuthOnHoldError) {
    return e.failure.reason;
  }

  if (e instanceof CredentialsMissingError) {
    return "credential_rejected";
  }

  const reason = classify?.(e);
  if (reason) {
    return reason;
  }

  const message = e instanceof Error ? e.message : String(e);

  // OAuth refresh token revoked or already used (Skolengo, AppScho, Multi).
  if (/invalid_grant/i.test(message)) {
    return "credential_rejected";
  }

  if (NETWORK_MESSAGE.test(message)) {
    return "network";
  }

  return "service_error";
};
