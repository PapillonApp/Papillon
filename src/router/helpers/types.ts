import {AddonLogs as AddonLog, AddonPlacementManifest} from "@/addons/types";
import type { Chat, ChatRecipient } from "@/services/shared/Chat";
import type {Grade, GradesPerSubject} from "@/services/shared/Grade";
import { Homework } from "@/services/shared/Homework";
import { ReservationHistory } from "@/services/shared/ReservationHistory";
import type { AccountService } from "@/stores/account/types";
import type { CurrentPosition } from "@/utils/native/location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type pronote from "pawnote";
import type React from "react";
import type { School as SkolengoSchool} from "scolengo-api/types/models/School";
import { ImageSourcePropType } from "react-native";
import {Client} from "pawrd";
import { Host } from "turboself-api";
import {Evaluation} from "@/services/shared/Evaluation";
import { ThemesMeta } from "@/utils/chat/themes/Themes.types";
import {MultiServiceSpace} from "@/stores/multiService/types";
import { TimetableClass } from "@/services/shared/Timetable";
import { ServiceCard } from "@/utils/external/restaurant";

export type RouteParameters = {
  // welcome.index
  AccountSelector?: { shouldCreateAccount: boolean };
  FirstInstallation: undefined;
  ColorSelector?: { settings: boolean };
  DevMenu: undefined;
  AccountCreated: undefined;
  ChangelogScreen: undefined;
  ProfilePic: undefined;

  // login.index
  ServiceSelector: undefined;

  // login.pronote
  PronoteAuthenticationSelector: undefined;
  PronoteGeolocation: undefined;
  PronoteManualLocation: undefined;
  PronoteInstanceSelector: {
    longitude: number;
    latitude: number;
    hideDistance?: boolean;
  };
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
  Multi_Login: {
    instanceURL: string;
    title: string;
    image: ImageSourcePropType;
  };
  UnivRennes1_Login: undefined;
  UnivRennes2_Login: undefined;
  UnivIUTLannion_Login: undefined;
  UnivLimoges_Login: undefined;
  UnivSorbonneParisNord_login: undefined;
  UnivUphf_Login: undefined;
  BackgroundIdentityProvider: undefined;
  BackgroundIUTLannion:
    | { url?: string; username: string; password: string; firstLogin?: boolean }
    | undefined;

  // login.skolengo
  SkolengoAuthenticationSelector: undefined;
  SkolengoGeolocation: undefined;
  SkolengoInstanceSelector: { pos: CurrentPosition | null };
  SkolengoWebview: { school: SkolengoSchool };
  // account.index
  Home: undefined;
  HomeScreen?: { onboard: boolean };

  Lessons?: { outsideNav?: boolean };
  LessonsImportIcal: {
    ical?: string;
    title?: string;
    autoAdd?: boolean;
  };
  LessonDocument: { lesson: TimetableClass };
  Week: { outsideNav?: boolean };

  Homeworks?: { outsideNav?: boolean };
  HomeworksDocument: { homework: Homework };
  AddHomework: {
    hwid?: string;
    modal?: boolean;
    defaults?: { subject: string; content: string; date: number };
  };

  News?: { outsideNav?: boolean; isED: boolean };
  NewsItem: { message: string; important: boolean; isED: boolean };

  Grades?: { outsideNav?: boolean };
  GradeSubject: { subject: GradesPerSubject; allGrades: Grade[] };
  GradeDocument: {
    grade: Grade;
    allGrades?: Grade[];
  };
  GradeReaction: { grade: Grade };

  Evaluation: { outsideNav?: boolean };
  EvaluationDocument: {
    evaluation: Evaluation;
    allEvaluations?: Evaluation[];
  };

  Attendance: { outsideNav?: boolean };

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
  SettingsSupport: undefined;
  SettingsIcons: undefined;
  SettingsSubjects: undefined;
  SettingsExternalServices: undefined;
  SettingsMagic: undefined;
  SettingsMultiService: undefined;
  SettingsMultiServiceSpace: { space: MultiServiceSpace };
  SettingsFlags: undefined;
  SettingsFlagsInfos: { title: string; value: any };
  SettingsAddons: undefined;
  SettingsDevLogs: undefined;
  SettingsDonorsList: undefined;
  SettingsReactions: undefined;
  SettingsAccessibility: undefined;

  Menu?: undefined;
  RestaurantQrCode: {
    card: ServiceCard;
  };
  RestaurantHistory: {
    histories: ReservationHistory[];
  };
  RestaurantCardDetail: {
    card: ServiceCard;
    outsideNav?: boolean;
  };
  RestaurantPaymentSuccess: {
    card: ServiceCard;
    diff: number;
  };

  Discussions: undefined;
  ChatCreate: undefined;
  ChatDetails: {
    handle: Chat;
    recipients: ChatRecipient[];
    onThemeChange?: (selectedThemePath: ThemesMeta) => void;
  };
  ChatThemes: {
    handle: Chat;
    themes: ThemesMeta[];
    onGoBack?: (selectedThemePath: ThemesMeta) => void;
  };
  Chat: { handle: Chat };

  AccountStack: { onboard: boolean };
  ExternalAccountSelectMethod: { service: AccountService | "Other" };
  ExternalAccountSelector: undefined;
  ExternalTurboselfLogin: undefined;
  ExternalArdLogin: undefined;
  ExternalIzlyLogin: undefined;
  ExternalAliseLogin: undefined;
  IzlyActivation: { username: string; password: string };
  PriceError: { account: Client; accountId: string };
  QrcodeScanner: { accountID: string };
  PriceDetectionOnboarding: { accountID: string };
  PriceBeforeScan: { accountID: string };
  PriceAfterScan: { accountID: string };
  TurboselfAccountSelector: {
    accounts: Array<Host>;
    username: string;
    password: string;
  };

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
