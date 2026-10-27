import { AuthFailure, AuthFailureReason, AuthStep, RELINK_AUTH_FAILURES, ServiceAuthState } from "./types";

const BACKOFF_BASE_MS = 30 * 1000;
const BACKOFF_MAX_MS = 15 * 60 * 1000;
const SUSPENSION_COOLDOWN_MS = 30 * 60 * 1000;

/** A relink, or a security challenge reached through the next login. */
export const needsUserAction = (reason: AuthFailureReason): boolean =>
  RELINK_AUTH_FAILURES.includes(reason) || reason === "security_challenge";

/** When the next login may go out, or undefined when only the user can unblock it. */
export const nextRetryAt = (
  reason: AuthFailureReason,
  consecutiveFailures: number,
  now: number
): number | undefined => {
  if (needsUserAction(reason)) {
    return undefined;
  }
  if (reason === "suspended") {
    return now + SUSPENSION_COOLDOWN_MS;
  }
  return now + Math.min(BACKOFF_BASE_MS * 2 ** Math.max(0, consecutiveFailures - 1), BACKOFF_MAX_MS);
};

/**
 * A failure only holds within the launch that hit it: a suspension or a
 * rejection can be lifted on the server well before our delay ends, so every
 * launch tries again.
 */
const failedThisLaunch = (state: ServiceAuthState | undefined, runtimeId: string): boolean =>
  Boolean(state?.failure && state.step === AuthStep.Failed && state.runtimeId === runtimeId);

/**
 * The failure that still holds the next login, with the time it lifts, or no
 * time when only a relink lifts it. Sending the same rejected credential again
 * can get the IP suspended.
 */
export const authHold = (
  state: ServiceAuthState | undefined,
  runtimeId: string,
  storedFingerprint: string,
  now: number
): { failure: AuthFailure; retryAt?: number } | undefined => {
  if (!state?.failure || !failedThisLaunch(state, runtimeId)) {
    return undefined;
  }

  if (RELINK_AUTH_FAILURES.includes(state.failure.reason)) {
    // A relink replaces the credentials, which lifts the block on its own.
    return state.credentialFingerprint === storedFingerprint ? { failure: state.failure } : undefined;
  }

  if (state.nextRetryAt && now < state.nextRetryAt) {
    return { failure: state.failure, retryAt: state.nextRetryAt };
  }

  return undefined;
};

export const isSuspended = (state: ServiceAuthState | undefined, runtimeId: string, now: number): boolean =>
  failedThisLaunch(state, runtimeId) &&
  state?.failure?.reason === "suspended" &&
  Boolean(state.nextRetryAt && now < state.nextRetryAt);

/**
 * What an explicit retry from the user (pull to refresh) lifts: a backoff or
 * a block. A suspension stays, the server enforces it and retrying extends it.
 */
export const liftedByUserRetry = (state: ServiceAuthState): ServiceAuthState =>
  state.step === AuthStep.Failed && state.failure?.reason !== "suspended"
    // Without a fingerprint, authHold no longer sees the stored credentials as the rejected ones.
    ? { ...state, nextRetryAt: undefined, credentialFingerprint: undefined }
    : state;
