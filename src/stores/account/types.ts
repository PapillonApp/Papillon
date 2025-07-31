import type pronote from "pawnote";

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
  color: PersonalizationColor;
  profilePictureB64?: string;
  hideNameOnHomeScreen: boolean;
  hideProfilePicOnHomeScreen: boolean;
  hideTabTitles: boolean;
  showTabBackground: boolean;
  showWeekFrequency: boolean;
  transparentTabBar: boolean;
  hideTabBar: boolean;
  popupRestauration?: boolean;
  magicEnabled?: boolean;
  MagicNews?: boolean;
  MagicHomeworks?: boolean;
  notifications?: {
    enabled?: boolean;
    news?: boolean;
    homeworks?: boolean;
    grades?: boolean;
    timetable?: boolean;
    attendance?: boolean;
    evaluation?: boolean;
  };
  icalURLs: PapillonIcalURL[];
  tabs: Tab[];
  subjects: {
    [subject: string]: {
      color: string;
      pretty: string;
      emoji: string;
    };
  };
  header: {
    gradient: PersonalizationHeaderGradient;
    image: string | undefined;
    darken: boolean;
  };
}

export interface PersonalizationHeaderGradient {
  startColor: string;
  endColor: string;
  angle: number;
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
  Local
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

export type PrimaryAccount = (
  | PronoteAccount
  | LocalAccount
);
export type ExternalAccount = never;

export type Account = PrimaryAccount;

export interface AccountsStore {
  lastOpenedAccountID: string | null
  accounts: Account[]
  setLastOpenedAccountID: (id: string | null) => void
  create: (account: Account) => void
  remove: (localID: string) => void
  update: <A extends Account, T extends keyof A = keyof A>(
    localID: string,
    key: T,
    value: A[T]
  ) => Account | null
}
