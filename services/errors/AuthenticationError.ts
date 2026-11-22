import { AuthFailureReason } from "@/services/auth/types";
import { ServiceAccount } from "@/stores/account/types";

export class AuthenticationError extends Error {
  public service: ServiceAccount
  public reason: AuthFailureReason

  constructor(message: string, service: ServiceAccount, reason: AuthFailureReason){
    super(message)
    this.service = service
    this.reason = reason
  }
}
