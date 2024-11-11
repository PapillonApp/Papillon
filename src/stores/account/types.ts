import type pronote from "pawnote";
import type { Account as PawdirecteAccount, Session as PawdirecteSession } from "pawdirecte";
import type { Client as ARDClient, Client as PawrdClient } from "pawrd";
import { Client as TurboselfClient } from "turboself-api";
import type ScolengoAPI from "scolengo-api";
import {Configuration, Identification} from "ezly";
import type MultiAPI from "esup-multi.js";
import { SkolengoAuthConfig } from "@/services/skolengo/skolengo-types";
import { User as ScolengoAPIUser } from "scolengo-api/types/models/Common";

export interface Tab {
  name: string
  enabled: boolean
}

export interface PersonalizationColor {
  id: string
  name: string
  description: string
  hex: {
    primary: string
    darker: string
    lighter: string
    dark: string
  }
}

export interface PapillonIcalURL {
  name: string
  url: string,
  lastRefreshed?: Date
}

export interface Personalization {
  color: PersonalizationColor
  profilePictureB64?: string,
  hideNameOnHomeScreen: boolean,
  hideProfilePicOnHomeScreen: boolean,
  hideTabTitles: boolean,
  showTabBackground: boolean,
  transparentTabBar: boolean,
  hideTabBar: boolean,
  popupRestauration?: boolean,
  magicEnabled?: boolean,
  MagicNews?: boolean,
  MagicHomeworks?: boolean,
  icalURLs: PapillonIcalURL[],
  tabs: Tab[],
  subjects: {
    [subject: string]: {
      color: string,
      pretty: string,
      emoji: string,
    }
  }
}

export interface CurrentAccountStore {
  /** Si un compte est en cours d'utilisation, on obtient l'ID, sinon `null`. */
  account: PrimaryAccount | null
  linkedAccounts: ExternalAccount[]
  mutateProperty: <T extends keyof PrimaryAccount>(key: T, value: PrimaryAccount[T]) => void
  linkExistingExternalAccount: (account: ExternalAccount) => void
  switchTo: (account: PrimaryAccount) => Promise<void>
  logout: () => void
}

export enum AccountService {
  Pronote,
  // For the future...
  EcoleDirecte,
  Skolengo,
  Local,
  WebResto,
  Turboself,
  ARD,
  Parcoursup,
  Onisep,
  Multi,
  Izly
}

/**
 * All the properties defined
 * for EVERY accounts stored.
 */
interface BaseAccount {
  localID: string
  isExternal: false

  name: string
  className?: string
  schoolName?: string
  linkedExternalLocalIDs: string[]

  studentName: {
    first: string
    last: string
  },
  personalization: Partial<Personalization>
}

interface BaseExternalAccount {
  localID: string
  isExternal: true
  username: string
  linkedExternalLocalIDs?: string[]
  data: Record<string, unknown>
}

export interface PronoteAccount extends BaseAccount {
  service: AccountService.Pronote
  instance?: pronote.SessionHandle;

  authentication: pronote.RefreshInformation & {
    deviceUUID: string
  }
  identityProvider?: undefined
}

export interface EcoleDirecteAccount extends BaseAccount {
  service: AccountService.EcoleDirecte
  instance: {}
  authentication: {
    session: PawdirecteSession
    account: PawdirecteAccount
  }
  identityProvider?: undefined
}

export interface SkolengoAccount extends BaseAccount {
  service: AccountService.Skolengo
  instance?: ScolengoAPI.Skolengo
  authentication: SkolengoAuthConfig
  userInfo: ScolengoAPIUser
  identityProvider?: undefined
}

export interface MultiAccount extends BaseAccount {
  service: AccountService.Multi
  instance?: MultiAPI.Multi
  authentication: {
    instanceURL: string
    refreshAuthToken: string
  }
  identityProvider?: undefined
}

export interface LocalAccount extends BaseAccount {
  service: AccountService.Local

  // Both are useless for local accounts.
  instance: undefined | Record<string, unknown>
  authentication: undefined | boolean

  identityProvider: {
    identifier: string
    name: string,
    rawData: Record<string, unknown>
  }

  credentials?: {
    username: string
    password: string
  }
}

export interface TurboselfAccount extends BaseExternalAccount {
  service: AccountService.Turboself
  instance: undefined
  authentication: {
    session: TurboselfClient
    username: string
    password: string
  }
}

export interface ARDAccount extends BaseExternalAccount {
  service: AccountService.ARD
  instance?: ARDClient
  authentication: {
    pid: string
    username: string
    password: string
    schoolID: string
  }
}

export interface IzlyAccount extends BaseExternalAccount {
  service: AccountService.Izly
  instance?: Identification
  authentication: {
    secret: string
    identification: Identification
    configuration: Configuration
  }
}

export type PrimaryAccount = (
  | PronoteAccount
  | EcoleDirecteAccount
  | SkolengoAccount
  | MultiAccount
  | LocalAccount
);
export type ExternalAccount = (
  | TurboselfAccount
  | ARDAccount
  | IzlyAccount
);

export type Account = (
  | PrimaryAccount
  | ExternalAccount
);

export interface AccountsStore {
  lastOpenedAccountID: string | null
  accounts: Account[]
  create: (account: Account) => void
  remove: (localID: string) => void
  update: <A extends Account, T extends keyof A = keyof A>(localID: string, key: T, value: A[T]) => Account | null
}
