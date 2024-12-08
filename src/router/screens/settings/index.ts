import createScreen from "@/router/helpers/create-screen";
import Settings from "@/views/settings/Settings";
import SettingsNotifications from "@/views/settings/SettingsNotifications";
import SettingsProfile from "@/views/settings/SettingsProfile";
import SettingsTrophies  from "@/views/settings/SettingsTrophies";
import SettingsAbout from "@/views/settings/SettingsAbout";
import SettingsIcons from "@/views/settings/SettingsIcons";
import SettingsSubjects from "@/views/settings/SettingsSubjects";
import SettingsExternalServices from "@/views/settings/SettingsExternalServices";
import SettingsMagic from "@/views/settings/SettingsMagic";
import SettingsAddons from "@/views/settings/SettingsAddons";
import AddonPage from "@/views/addon/AddonPage";
import { create } from "lodash";
import ExternalAccountSelectMethod from "@/views/settings/ExternalAccount/SelectMethod";
import SettingsFlags from "@/views/settings/SettingsFlags";
import SettingsDevLogs from "@/views/settings/SettingsDevLogs";
import ExternalTurboselfLogin from "@/views/settings/ExternalAccount/Turboself";
import ExternalArdLogin from "@/views/settings/ExternalAccount/ARD";
import SettingsDonorsList from "@/views/settings/SettingsDonorsList";
import ExternalAccountSelector from "@/views/settings/ExternalAccount/ServiceSelector";
import PriceError from "@/views/settings/ExternalAccount/PriceError";
import QrcodeScanner from "@/views/settings/ExternalAccount/QrcodeScanner";
import PriceDetectionOnboarding from "@/views/settings/ExternalAccount/PriceDetectionOnboarding";
import PriceBeforeScan from "@/views/settings/ExternalAccount/PriceBeforeScan";
import SettingsFlagsInfos from "@/views/settings/SettingsFlagsInfos";
import ExternalIzlyLogin from "@/views/settings/ExternalAccount/Izly";
import IzlyActivation from "@/views/settings/ExternalAccount/IzlyActivation";

const settingsScreens = [
  createScreen("Settings", Settings, {
    presentation: "modal",
    headerTitle: "Paramètres",
    headerShown: false,
  }),
  createScreen("SettingsNotifications", SettingsNotifications, {
    headerTitle: "Notifications",
  }),
  createScreen("SettingsTrophies", SettingsTrophies, {
    headerTitle: "Trophées",
  }),
  createScreen("SettingsProfile", SettingsProfile, {
    headerTitle: "Profil",
  }),
  createScreen("SettingsAbout", SettingsAbout, {
    headerTitle: "À propos",
  }),
  createScreen("SettingsIcons", SettingsIcons, {
    headerTitle: "Icônes",
  }),
  createScreen("SettingsFlags", SettingsFlags, {
    headerTitle: "Flags (développeur)",
  }),
  createScreen("SettingsFlagsInfos", SettingsFlagsInfos),

  createScreen("SettingsSubjects", SettingsSubjects, {
    headerTitle: "Matières",
  }),
  createScreen("SettingsExternalServices", SettingsExternalServices, {
    headerTitle: "Services externes",
  }),
  createScreen("SettingsMagic", SettingsMagic, {
    headerTitle: "Papillon Magic",
  }),
  createScreen("SettingsAddons", SettingsAddons, {
    headerTitle: "Extensions",
  }),
  createScreen("AddonPage", AddonPage, {
    headerTitle: "Extension",
  }),

  createScreen("ExternalAccountSelectMethod", ExternalAccountSelectMethod, {
    headerTitle: "Connexion à un service externe",
  }),

  createScreen("ExternalAccountSelector", ExternalAccountSelector, {
    headerTitle: "Configuration de la cantine",
  }),

  createScreen("PriceError", PriceError, {
    headerTitle: "Configuration de la cantine",
  }),

  createScreen("QrcodeScanner", QrcodeScanner, {
    headerTitle: "Configuration de la cantine",
  }),

  createScreen("PriceDetectionOnboarding", PriceDetectionOnboarding, {
    headerTitle: "Configuration de la cantine",
  }),

  createScreen("PriceBeforeScan", PriceBeforeScan, {
    headerTitle: "Configuration de la cantine",
  }),

  createScreen("ExternalTurboselfLogin", ExternalTurboselfLogin, {
    headerTitle: "Connexion à Turboself",
  }),
  createScreen("ExternalArdLogin", ExternalArdLogin, {
    headerTitle: "Connexion à ARD GEC",
  }),
  createScreen("ExternalIzlyLogin", ExternalIzlyLogin, {
    headerTitle: "Connexion à Izly",
  }),

  createScreen("IzlyActivation", IzlyActivation, {
    headerTitle: "Configuration de Izly",
    presentation: "modal",
    headerBackVisible: false,
    gestureEnabled: false,

  }),

  createScreen("SettingsDevLogs", SettingsDevLogs, {
    headerTitle: "Logs",
  }),

  createScreen("SettingsDonorsList", SettingsDonorsList, {
    headerTitle: "Donateurs",
  }),
] as const;

export default settingsScreens;
