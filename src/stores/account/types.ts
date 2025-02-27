import type pronote from "pawnote";
import type { Account as PawdirecteAccount, Session as PawdirecteSession } from "pawdirecte";
import type { Client as ARDClient } from "pawrd";
import { Client as TurboselfClient } from "turboself-api";
import { Client as AliseClient, BookingDay } from "alise-api";
import type ScolengoAPI from "scolengo-api";
import { Configuration, Identification } from "ezly";
import type MultiAPI from "esup-multi.js";
import { SkolengoAuthConfig } from "@/services/skolengo/skolengo-types";
import { User as ScolengoAPIUser } from "scolengo-api/types/models/Common";
import { OnlinePayments } from "pawrd/dist";

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
  showWeekFrequency: boolean,
  transparentTabBar: boolean,
  hideTabBar: boolean,
  popupRestauration?: boolean,
  magicEnabled?: boolean,
  MagicNews?: boolean,
  MagicHomeworks?: boolean,
  notifications?: {
    enabled?: boolean
    news?: boolean
    homeworks?: boolean
    grades?: boolean
    timetable?: boolean
    attendance?: boolean
    evaluation?: boolean
  }
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

export interface Identity {
  firstName?: string,
  lastName?: string,
  civility?: string,
  boursier?: boolean,
  ine?: string,
  birthDate?: Date,
  birthPlace?: string,
  phone?: string[],
  email?: string[],
  address?: {
    street?: string,
    zipCode?: string,
    city?: string,
  },
}

export interface CurrentAccountStore {
  /** Si un compte est en cours d'utilisation, on obtient l'ID, sinon `null`. */
  account: PrimaryAccount | null
  linkedAccounts: ExternalAccount[]
  associatedAccounts: PrimaryAccount[]
  mutateProperty: <T extends keyof PrimaryAccount>(
    key: T,
    value: PrimaryAccount[T], forceMutation?: boolean
  ) => void
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
  Izly,
  Alise,
  PapillonMultiService
}

/**
 * All the properties defined
 * for EVERY accounts stored.
 */
interface BaseAccount {
  localID: string;
  isExternal: false;

  name: string;
  className?: string;
  schoolName?: string;
  linkedExternalLocalIDs: string[];
  identity: Partial<Identity>;

  studentName: {
    first: string;
    last: string;
  };
  personalization: Partial<Personalization>;
}

interface BaseExternalAccount {
  localID: string
  isExternal: true
  username: string
  linkedExternalLocalIDs?: string[]
  data: Record<string, unknown>
}

export interface PronoteAccount extends BaseAccount {
  service: AccountService.Pronote;
  instance?: pronote.SessionHandle;

  authentication: pronote.RefreshInformation & {
    deviceUUID: string;
  };
  identityProvider?: undefined;
  providers: string[];
  serviceData: Record<string, unknown>;
  associatedAccountsLocalIDs?: undefined
}

export interface EcoleDirecteAccount extends BaseAccount {
  profilePictureURL: string;
  service: AccountService.EcoleDirecte;
  instance: {};
  authentication: {
    session: PawdirecteSession
    account: PawdirecteAccount
  }
  identityProvider?: undefined
  associatedAccountsLocalIDs?: undefined
  providers: string[];
  serviceData: Record<string, unknown>;
}

export interface SkolengoAccount extends BaseAccount {
  service: AccountService.Skolengo;
  instance?: ScolengoAPI.Skolengo;
  authentication: SkolengoAuthConfig;
  userInfo: ScolengoAPIUser;
  identityProvider?: undefined;
  providers: string[];
  serviceData: Record<string, unknown>;
  associatedAccountsLocalIDs?: undefined
}

export interface MultiAccount extends BaseAccount {
  service: AccountService.Multi
  instance?: MultiAPI.Multi
  authentication: {
    instanceURL: string
    refreshAuthToken: string
  }
  identityProvider?: undefined
  associatedAccountsLocalIDs?: undefined
  providers: string[]
  serviceData: Record<string, unknown>
}

export interface LocalAccount extends BaseAccount {
  service: AccountService.Local;

  // Both are useless for local accounts.
  instance: undefined | Record<string, unknown>;
  authentication: undefined | boolean;

  identityProvider: {
    identifier: string;
    name: string;
    rawData: Record<string, unknown>;
  };

  credentials?: {
    username: string;
    password: string;
  };

  providers?: string[];
  serviceData: Record<string, unknown>;
  associatedAccountsLocalIDs?: undefined
}

export interface PapillonMultiServiceSpace extends BaseAccount {
  service: AccountService.PapillonMultiService
  instance: null | string
  authentication: null
  identityProvider: {
    name: string,
    identifier: undefined,
    rawData: undefined
  },
  associatedAccountsLocalIDs: string[]
  providers: string[]
  serviceData: Record<string, unknown>
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

export interface AliseAccount extends BaseExternalAccount {
  service: AccountService.Alise
  instance: undefined
  authentication: {
    session: AliseClient
    schoolID: string
    username: string
    password: string
    bookings: BookingDay[]
    mealPrice: number
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
    balances: OnlinePayments
    mealPrice: number
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
  | PapillonMultiServiceSpace
);
export type ExternalAccount = (
  | TurboselfAccount
  | ARDAccount
  | IzlyAccount
  | AliseAccount
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
  update: <A extends Account, T extends keyof A = keyof A>(
    localID: string,
    key: T,
    value: A[T]
  ) => Account | null
}
