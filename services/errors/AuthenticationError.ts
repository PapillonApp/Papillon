import { ServiceAccount } from "@/stores/account/types";

export class AuthenticationError extends Error {
  public service: ServiceAccount

  constructor(message: string, service: ServiceAccount){
    super(message)
    this.service = service
  }
}