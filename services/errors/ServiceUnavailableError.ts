import { AuthFailureReason } from "@/services/auth/types";
import { ServiceAccount } from "@/stores/account/types";

export class ServiceUnavailableError extends Error {
  public service: ServiceAccount;
  public reason: AuthFailureReason;

  constructor(message: string, service: ServiceAccount, reason: AuthFailureReason) {
    super(message);
    this.name = "ServiceUnavailableError";
    this.service = service;
    this.reason = reason;
  }
}
