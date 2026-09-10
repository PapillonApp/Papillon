import { SecurityError, SessionHandle } from "@blockshub/pawnote-lts";

import { ServiceAccount } from "@/stores/account/types";

export class SecurityChallengeError extends Error {
  public securityError: SecurityError;
  public session: SessionHandle;
  public deviceUUID: string;
  public service?: ServiceAccount;

  constructor(
    securityError: SecurityError,
    session: SessionHandle,
    deviceUUID: string,
    service?: ServiceAccount
  ) {
    super(securityError.message || "Pronote requires a security challenge");
    this.name = "SecurityChallengeError";
    this.securityError = securityError;
    this.session = session;
    this.deviceUUID = deviceUUID;
    this.service = service;
  }
}
