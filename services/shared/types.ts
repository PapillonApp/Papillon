import { Auth, Services } from "@/stores/account/types";
import { Pronote } from "@/services/pronote";

/** Represents a plugin for a school service.
 *
 * @property {string} displayName - The name of the service displayed to the user.
 * @property {Services} service - The identifier for the service.
 * @property {function} refreshAccount - Function used to refresh the account credentials.
 */
export interface SchoolServicePlugin {
  displayName: string;
  service: Services;
  authData: Auth;

  refreshAccount: (credentials: Auth) => Promise<Pronote>;
}