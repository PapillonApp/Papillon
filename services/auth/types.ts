import { Auth } from "@/stores/account/types";

/**
 * Where a service session renewal stands. Persisted on every change so a
 * killed app knows what happened on its next launch.
 */
export enum AuthStep {
  /** Login started, nothing sent yet: stopping here is harmless. */
  Starting = "starting",
  /** The stored credential left the device, the server still accepts it. */
  CredentialSent = "credential_sent",
  /** Point of no return: the server may have consumed the old credential. */
  AwaitingNewCredential = "awaiting_new_credential",
  /** The new credential is saved in the account store. */
  CredentialReceived = "credential_received",
  Ready = "ready",
  /** The server ended the session while fetching data: the credential is still valid. */
  Expired = "expired",
  Failed = "failed",
}

export const ACTIVE_AUTH_STEPS: readonly AuthStep[] = [
  AuthStep.Starting,
  AuthStep.CredentialSent,
  AuthStep.AwaitingNewCredential,
  AuthStep.CredentialReceived,
];

export type AuthFailureReason =
  | "network"
  | "credential_rejected"
  /** Rejected after an interrupted rotation: the new credential never arrived. */
  | "credential_lost"
  | "security_challenge"
  | "session_expired"
  | "suspended"
  | "account_disabled"
  | "service_error";

/** Only a new login by the user can fix these. */
export const RELINK_AUTH_FAILURES: readonly AuthFailureReason[] = [
  "credential_rejected",
  "credential_lost",
  "account_disabled",
];

export interface AuthFailure {
  reason: AuthFailureReason;
  step: AuthStep;
  message: string;
}

export interface ServiceAuthState {
  step: AuthStep;
  /** The app launch that wrote this state: its failures only hold within it. */
  runtimeId: string;
  updatedAt: number;
  /** Short hash of the credentials last sent, never the credentials themselves. */
  credentialFingerprint?: string;
  failure?: AuthFailure;
  consecutiveFailures: number;
  nextRetryAt?: number;
}

/** Maps a service's own errors; undefined falls back to the generic rules. */
export type AuthErrorClassifier = (e: unknown) => AuthFailureReason | undefined;

export interface AuthRefreshOptions {
  /** The service hands out a new credential on each login (PRONOTE, EcoleDirecte, Skolengo). */
  rotatesCredential: boolean;
  classifyError?: AuthErrorClassifier;
}

export interface AuthTracker {
  /** Credentials from the account store, the source of truth. */
  readCredentials: () => Auth;
  credentialSent: (auth: Auth) => void;
  awaitingNewCredential: () => void;
  /** Saves the new credentials to the account store right away. */
  credentialReceived: (auth: Auth) => void;
}
