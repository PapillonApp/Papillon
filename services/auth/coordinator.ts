import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";
import { useAuthStateStore } from "@/stores/authState";
import { debug, warn } from "@/utils/logger/logger";

import { AuthOnHoldError, classifyAuthError } from "./errors";
import { authHold, isSuspended, liftedByUserRetry, nextRetryAt } from "./policy";
import {
  ACTIVE_AUTH_STEPS,
  AuthFailureReason,
  AuthRefreshOptions,
  AuthStep,
  AuthTracker,
  ServiceAuthState,
} from "./types";

/** A step not refreshed for this long belongs to a dead runtime. */
const AUTH_LEASE_MS = 15 * 1000;
const LEASE_HEARTBEAT_MS = 5 * 1000;
const LEASE_POLL_MS = 500;
/** A login hung past this stops renewing its lease, so it can't block other runtimes forever. */
const MAX_LEASE_MS = 2 * 60 * 1000;
const MAX_FAILURE_MESSAGE_LENGTH = 300;

const RUNTIME_ID = Math.random().toString(36).slice(2, 10);

const inFlight = new Map<string, Promise<unknown>>();

// FNV-1a tells two credentials apart. A short password could be brute-forced
// from it, which is why the auth state is stored encrypted.
const fingerprint = (auth: Auth): string => {
  const value = JSON.stringify(auth);
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const describeError = (e: unknown): string =>
  (e instanceof Error ? `${e.name}: ${e.message}` : String(e)).slice(0, MAX_FAILURE_MESSAGE_LENGTH);

const readStoredAuth = (serviceId: string, fallback: Auth): Auth => {
  for (const account of useAccountStore.getState().accounts) {
    const service = account.services.find(s => s.id === serviceId);
    if (service) {
      return service.auth;
    }
  }
  return fallback;
};

export const getAuthState = (serviceId: string): ServiceAuthState | undefined =>
  useAuthStateStore.getState().services[serviceId];

const failedState = (
  previous: ServiceAuthState,
  reason: AuthFailureReason,
  e: unknown
): ServiceAuthState => {
  const now = Date.now();
  const consecutiveFailures = previous.consecutiveFailures + 1;
  return {
    ...previous,
    step: AuthStep.Failed,
    runtimeId: RUNTIME_ID,
    updatedAt: now,
    consecutiveFailures,
    nextRetryAt: nextRetryAt(reason, consecutiveFailures, now),
    failure: { reason, step: previous.step, message: describeError(e) },
  };
};

const writeState = (serviceId: string, state: ServiceAuthState) => {
  useAuthStateStore.getState().setServiceState(serviceId, state);
};

export const clearAuthState = (serviceId: string): void => {
  useAuthStateStore.getState().clearServiceState(serviceId);
};

export const pruneAuthStates = (existingServiceIds: string[]): void => {
  useAuthStateStore.getState().prune(existingServiceIds);
};

const isForeignLease = (state: ServiceAuthState | undefined): boolean =>
  Boolean(
    state &&
    state.runtimeId !== RUNTIME_ID &&
    ACTIVE_AUTH_STEPS.includes(state.step) &&
    // abs: a clock set back must not turn the lease into an hour-long wait.
    Math.abs(Date.now() - state.updatedAt) < AUTH_LEASE_MS
  );

/**
 * Waits for a renewal running in another JS runtime to end or go stale, so
 * both never send the same single-use credential.
 */
const waitForForeignLease = async (serviceId: string): Promise<void> => {
  await useAuthStateStore.persist.rehydrate();
  if (!isForeignLease(getAuthState(serviceId))) {
    return;
  }

  debug(`Authentication of ${serviceId} is running in another runtime, waiting for it.`);
  while (isForeignLease(getAuthState(serviceId))) {
    await new Promise(resolve => setTimeout(resolve, LEASE_POLL_MS));
    await useAuthStateStore.persist.rehydrate();
  }
  // The other runtime may have saved a new credential.
  await useAccountStore.persist.rehydrate();
};

export const allowAuthRetry = (serviceId: string): void => {
  const state = getAuthState(serviceId);
  if (state) {
    writeState(serviceId, liftedByUserRetry(state));
  }
};

/** Pull to refresh on any screen: the user asks to try again now. */
export const allowAllAuthRetries = (): void => {
  Object.keys(useAuthStateStore.getState().services).forEach(allowAuthRetry);
};

/** Refuses any request, login or data, while the server suspends this IP. */
export const assertSessionUsable = (serviceId: string): void => {
  const state = getAuthState(serviceId);
  if (state?.failure && isSuspended(state, RUNTIME_ID, Date.now())) {
    throw new AuthOnHoldError(serviceId, state.failure, state.nextRetryAt);
  }
};

/**
 * Records a session the server ended while fetching data, after the login:
 * the state would otherwise still claim it is ready.
 */
export const reportSessionError = (
  serviceId: string,
  reason: "session_expired" | "suspended",
  e: unknown
): void => {
  // A login running in this runtime records its own outcome; writing here
  // would drop its active step, and with it the lease.
  if (inFlight.has(serviceId)) {
    return;
  }

  const previous: ServiceAuthState = getAuthState(serviceId) ?? {
    step: AuthStep.Ready,
    runtimeId: RUNTIME_ID,
    updatedAt: Date.now(),
    consecutiveFailures: 0,
  };

  writeState(
    serviceId,
    reason === "session_expired"
      ? { ...previous, step: AuthStep.Expired, runtimeId: RUNTIME_ID, updatedAt: Date.now() }
      : failedState(previous, reason, e)
  );

  warn(`Session of ${serviceId} ended while fetching data (${reason}).`);
};

/**
 * Every service login goes through here: it joins a running renewal, writes
 * each step to disk and records why it failed.
 */
export function runAuthRefresh<T>(
  serviceId: string,
  fallback: Auth,
  options: AuthRefreshOptions,
  run: (tracker: AuthTracker) => Promise<T>
): Promise<T> {
  const pending = inFlight.get(serviceId);
  if (pending) {
    return pending as Promise<T>;
  }

  const task = execute(serviceId, fallback, options, run).finally(() => {
    inFlight.delete(serviceId);
  });
  inFlight.set(serviceId, task);
  return task;
}

async function execute<T>(
  serviceId: string,
  fallback: Auth,
  options: AuthRefreshOptions,
  run: (tracker: AuthTracker) => Promise<T>
): Promise<T> {
  await waitForForeignLease(serviceId);

  const previous = getAuthState(serviceId);
  const hold = authHold(previous, RUNTIME_ID, fingerprint(readStoredAuth(serviceId, fallback)), Date.now());
  if (hold) {
    throw new AuthOnHoldError(serviceId, hold.failure, hold.retryAt);
  }

  // Still active but stale: the app or the task died during that step.
  const interruptedStep =
    previous && ACTIVE_AUTH_STEPS.includes(previous.step) ? previous.step : undefined;
  if (interruptedStep) {
    warn(`Previous authentication of ${serviceId} was interrupted at "${interruptedStep}".`);
  }

  // Set once a rotation was cut after the point of no return: a rejection
  // that follows means the credential was lost, not that it was wrong.
  let rotationInterrupted =
    options.rotatesCredential && interruptedStep === AuthStep.AwaitingNewCredential;

  let state: ServiceAuthState = {
    step: AuthStep.Starting,
    runtimeId: RUNTIME_ID,
    updatedAt: Date.now(),
    credentialFingerprint: previous?.credentialFingerprint,
    failure: previous?.failure,
    consecutiveFailures: previous?.consecutiveFailures ?? 0,
  };

  const update = (patch: Partial<ServiceAuthState>) => {
    state = { ...state, ...patch, updatedAt: Date.now() };
    writeState(serviceId, state);
  };

  update({});
  // A login with network retries outlasts the lease: keep it alive.
  const leaseStartedAt = Date.now();
  const heartbeat = setInterval(() => {
    if (Date.now() - leaseStartedAt > MAX_LEASE_MS) {
      clearInterval(heartbeat);
      return;
    }
    update({});
  }, LEASE_HEARTBEAT_MS);

  const tracker: AuthTracker = {
    readCredentials: () => readStoredAuth(serviceId, fallback),
    credentialSent: auth => {
      if (options.rotatesCredential && state.step === AuthStep.AwaitingNewCredential) {
        rotationInterrupted = true;
      }
      update({ step: AuthStep.CredentialSent, credentialFingerprint: fingerprint(auth) });
    },
    awaitingNewCredential: () => update({ step: AuthStep.AwaitingNewCredential }),
    credentialReceived: auth => {
      useAccountStore.getState().updateServiceAuthData(serviceId, auth);
      rotationInterrupted = false;
      update({ step: AuthStep.CredentialReceived, credentialFingerprint: fingerprint(auth) });
    },
  };

  try {
    const result = await run(tracker);
    update({
      step: AuthStep.Ready,
      failure: undefined,
      consecutiveFailures: 0,
      nextRetryAt: undefined,
    });
    return result;
  } catch (e) {
    let reason = classifyAuthError(e, options.classifyError);
    if (reason === "credential_rejected" && rotationInterrupted) {
      reason = "credential_lost";
    }

    const failedAt = state.step;
    state = failedState(state, reason, e);
    writeState(serviceId, state);

    warn(`Authentication of ${serviceId} failed at "${failedAt}" (${reason}): ${state.failure?.message}`);
    throw e;
  } finally {
    clearInterval(heartbeat);
  }
}
