import * as Ezly from "ezly";
import { Session } from "pawdirecte";
import { Skolengo } from "skolengojs";

/**
 * Represents the storage structure for user accounts.
 *
 * @property {string} lastUsedAccount - The identifier of the most recently used account.
 * @property {Account[]} accounts - An array of `Account` objects associated with the storage.
 */
export interface AccountsStorage {
  lastUsedAccount: string;
  accounts: Account[];
  removeAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
  setLastUsedAccount: (accountId: string) => void;
  updateServiceAuthData: (serviceId: string, authData: Auth) => void;
  addServiceToAccount: (accountId: string, service: ServiceAccount) => void;
  removeServiceFromAccount: (serviceId: string) => void;
  setAccountName: (accountId: string, firstName: string, lastName: string) => void;
  setSubjectColor: (subject: string, color: string) => void;
  setSubjectEmoji: (subject: string, emoji: string) => void;
  setSubjectName: (subject: string, name: string) => void;
  setSubjects: (subjects: Record<string, { color: string; emoji: string; name: string }>) => void;
  setAccountProfilePicture: (accountId: string, profilePicture: string) => void;
}

/**
 * Represents a user account.
 *
 * @property {string} id - Unique identifier for the account (read-only).
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} [schoolName] - (Optional) The name of the user's school.
 * @property {ServiceAccount[]} services - List of service accounts associated with this account.
 * @property {string} createdAt - ISO string representing the account creation date (stored as string due to MMKV limitations).
 * @property {string} updatedAt - ISO string representing the last update date (stored as string due to MMKV limitations).
 */
export interface Account {
  readonly id: string;
  firstName: string;
  lastName: string;
  schoolName?: string;
  className?: string;
  customisation?: CustomisationStorage;
  services: ServiceAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomisationStorage {
  profilePicture: string;
  subjects: Record<string, { color: string; emoji: string; name: string }>;
}

/**
 * Represents a service account.
 *
 * @property {string} id - Unique identifier for the service account.
 * @property {Services} serviceId - Identifier for the associated service.
 * @property {Auth} auth - Authentication details for the account (access token, refresh token...).
 * @property {string} createdAt - ISO string representing the account creation date (stored as string due to MMKV limitations).
 * @property {string} updatedAt - ISO string representing the last update date (stored as string due to MMKV limitations).
 * @property {string} [firstName] - Optional first name of the account holder.
 * @property {string} [lastName] - Optional last name of the account holder.
 */
export interface ServiceAccount {
  readonly id: string;
  auth: Auth;
  serviceId: Services;
  createdAt: string;
  updatedAt: string;
  additionals?: Record<string, string>;
}

/**
 * Represents authentication credentials and additional metadata.
 *
 * @property {string} [accessToken] - Optional access token used for authentication.
 * @property {string} [refreshToken] - Optional refresh token used to obtain new access tokens.
 * @property {Skolengo} [session] - Optional, used in some libraries like Skolengo.js
 * @property {string} [additionals] - Optional record containing additional authentication-related key-value pairs.
 */
export interface Auth {
  accessToken?: string;
  refreshToken?: string;
  session?: Skolengo | Session | Ezly.Identification;
  additionals?: Record<string, string | number>;
}

export enum Services {
  PRONOTE,
  SKOLENGO,
  ECOLEDIRECTE,
  TURBOSELF,
  ARD,
  IZLY,
  MULTI,
  ALISE,
  APPSCHO,
  LANNION
}
