import {
  AccessDeniedError,
  AccountDisabledError,
  AuthenticateError,
  BadCredentialsError,
  BusyPageError,
  PageUnavailableError,
  SecurityError,
  SessionExpiredError,
  SuspendedIPError,
} from "@blockshub/pawnote-lts";

import { AuthErrorClassifier } from "@/services/auth/types";
import { SecurityChallengeError } from "@/services/errors/SecurityChallengeError";

export const classifyPronoteError: AuthErrorClassifier = e => {
  if (e instanceof SecurityChallengeError || e instanceof SecurityError) {
    return "security_challenge";
  }
  if (e instanceof SuspendedIPError) {
    return "suspended";
  }
  if (e instanceof AccessDeniedError || e instanceof AccountDisabledError) {
    return "account_disabled";
  }
  // "La page a expiré": the server dropped the session, the token itself is fine.
  if (e instanceof SessionExpiredError) {
    return "session_expired";
  }
  if (e instanceof BadCredentialsError) {
    return "credential_rejected";
  }
  // A message shown on login (closure, maintenance): the token may well be
  // valid, so it must not get blocked.
  if (e instanceof AuthenticateError || e instanceof BusyPageError || e instanceof PageUnavailableError) {
    return "service_error";
  }
  return undefined;
};
