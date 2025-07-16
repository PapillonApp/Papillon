import { SessionHandle } from "pawnote";

import { Pronote } from "@/services/pronote";
import { Homework } from "@/services/shared/homework";
import { Auth, Services } from "@/stores/account/types";
import { News } from "@/services/shared/news";

/** Represents a plugin for a school service.
 *
 * @property {string} displayName - The name of the service displayed to the user.
 * @property {Services} service - The identifier for the service.
 * @property {function} refreshAccount - Function used to refresh the account credentials.
 */
export interface SchoolServicePlugin {
  displayName: string;
  service: Services;
  capabilities: Capabilities[];
  authData: Auth;
  session: SessionHandle | undefined;

  refreshAccount: (credentials: Auth) => Promise<Pronote>;
  getHomeworks?: () => Promise<Array<Homework>>;
  getNews?: () => Promise<Array<News>>;
}

/*
  *
  * Represents the capabilities of a school service plugin.
  * Used to determine what features the plugin supports.
 */
export enum Capabilities {
  REFRESH,
  HOMEWORK,
  NEWS
}

/**
 * Represents a generic interface for objects that have a createdByAccount property.
 *
 * @property {string} createdByAccount - The local account that created the object, useful for the manager.
 */
export interface GenericInterface {
  createdByAccount: string;
}