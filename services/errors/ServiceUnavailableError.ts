import { ServiceAccount } from "@/stores/account/types";

export class ServiceUnavailableError extends Error {
  public service: ServiceAccount;

  constructor(message: string, service: ServiceAccount) {
    super(message);
    this.name = "ServiceUnavailableError";
    this.service = service;
  }
}
