import {AddonLogs as AddonLog, AddonPlacementManifest} from "@/addons/types";
import type { Chat } from "@/services/shared/Chat";
import type {Grade, GradesPerSubject} from "@/services/shared/Grade";
import { Homework } from "@/services/shared/Homework";
import { ReservationHistory } from "@/services/shared/ReservationHistory";
import type { AccountService } from "@/stores/account/types";
import { Log } from "@/utils/logger/logger";
import type { CurrentPosition } from "@/utils/native/location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type pronote from "pawnote";
import type React from "react";
import type { School as SkolengoSchool} from "scolengo-api/types/models/School";
import {Information} from "@/services/shared/Information";
import { ImageSourcePropType } from "react-native";
import {Client} from "pawrd";

export type RouteParameters = {
  // welcome.index
  AccountSelector?: { shouldCreateAccount: boolean };
  FirstInstallation: undefined;
  ColorSelector?: { settings: boolean };
  DevMenu: undefined;
  AccountCreated: undefined;
  ChangelogScreen: undefined;

  // login.index
  ServiceSelector: undefined;

  // login.pronote
  PronoteAuthenticationSelector: undefined;
  PronoteGeolocation: undefined;
  PronoteManualLocation: undefined;
  PronoteInstanceSelector: CurrentPosition;
  PronoteCredentials: { instanceURL: string; information: pronote.Instance };
  PronoteManualURL?: { url?: string; method?: string };
  PronoteQRCode: undefined;
  PronoteWebview: { instanceURL: string };
  PronoteV6Import: {
    data: {
      username: string;
      deviceUUID: string;
      instanceUrl: string;
      nextTimeToken: string;
    };
  };
  Pronote2FA_Auth: {
    session: pronote.SessionHandle;
    error: pronote.SecurityError;
    accountID: string;
  };

  // login.ecoledirecte
  EcoleDirecteCredentials: undefined;

  // login.identityProvider
  IdentityProviderSelector: undefined;
  Multi_Login: { instanceURL: string, title: string, image: ImageSourcePropType };
  UnivRennes1_Login: undefined;
  UnivRennes2_Login: undefined;
  UnivIUTLannion_Login: undefined;
  UnivLimoges_Login: undefined;
  UnivSorbonneParisNord_login: undefined;
  UnivUphf_Login: undefined;
  BackgroundIUTLannion: { url?: string; username: string; password: string, firstLogin?: boolean } | undefined;

  // login.skolengo
  SkolengoAuthenticationSelector: undefined;
  SkolengoGeolocation: undefined;
  SkolengoInstanceSelector: { pos: CurrentPosition | null };
  SkolengoWebview: { school: SkolengoSchool };
  // account.index
  Home: undefined;
  HomeScreen?: { onboard: boolean };
  NoteReaction: undefined;

  Lessons?: { outsideNav?: boolean };
  LessonsImportIcal: {
    ical?: string;
    title?: string;
    autoAdd?: boolean;
  };
  LessonDocument: { lesson: Homework };

  Homeworks?: { outsideNav?: boolean };
  HomeworksDocument: { homework: Homework };

  News?: { outsideNav?: boolean; isED: boolean };
  NewsItem: { message: string; important: boolean; isED: boolean };

  Grades?: { outsideNav?: boolean };
  GradeSubject: { subject: GradesPerSubject; allGrades: Grade[] };
  GradeDocument: {
    grade: Grade;
    allGrades?: Grade[];
  };

  Attendance: undefined;

  // settings.externalAccount
  SelectMethod: undefined;

  // settings.index
  SettingStack: any;
  Settings?: {
    view: keyof RouteParameters;
  };
  SettingsNotifications: undefined;
  SettingsTrophies: undefined;
  SettingsProfile: undefined;
  SettingsTabs: undefined;
  SettingsAbout: undefined;
  SettingsIcons: undefined;
  SettingsSubjects: undefined;
  SettingsExternalServices: undefined;
  SettingsMagic: undefined;
  SettingsFlags: undefined;
  SettingsFlagsInfos: { title: string; value: any };
  SettingsAddons: undefined;
  SettingsDevLogs: undefined;
  SettingsDonorsList: undefined;

  Menu?: undefined;
  RestaurantQrCode: {
    QrCodes: string[]
  };
  RestaurantHistory: {
    histories: ReservationHistory[]
  };

  Messages: undefined;
  ChatCreate: undefined;
  Chat: { handle: Chat };

  AccountStack: { onboard: boolean };
  ExternalAccountSelectMethod: { service: AccountService | "Other" };
  ExternalAccountSelector: undefined;
  ExternalTurboselfLogin: undefined;
  ExternalArdLogin: undefined;
  ExternalIzlyLogin: undefined;
  IzlyActivation: { username: string, password: string };
  PriceError: { account: Client, accountId: string };
  QrcodeScanner: { accountID: string };
  PriceDetectionOnboarding: { accountID: string };
  PriceBeforeScan: { accountID: string };
  PriceAfterScan: { accountID: string };


  AddonSettingsPage: {
    addon: AddonPlacementManifest;
    from: keyof RouteParameters;
  };
  AddonLogs: {
    logs: AddonLog[];
    name: string;
  };
  AddonPage: {
    addon: AddonPlacementManifest;
    from: string;
    data: any;
  };
};

export type RouterScreenProps<ScreenName extends keyof RouteParameters> =
  NativeStackScreenProps<RouteParameters, ScreenName>;
export type Screen<ScreenName extends keyof RouteParameters> = React.FC<
  RouterScreenProps<ScreenName>
>;
