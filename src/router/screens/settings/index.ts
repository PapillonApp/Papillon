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
import QrcodeAnswer from "@/views/settings/ExternalAccount/QrcodeAnswer";
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
    animation: "simple_push",
  }),
  createScreen("SettingsNotifications", SettingsNotifications, {
    headerTitle: "Notifications",
    animation: "slide_from_right",
  }),
  createScreen("SettingsTrophies", SettingsTrophies, {
    headerTitle: "Trophées",
    animation: "slide_from_right",
  }),
  createScreen("SettingsProfile", SettingsProfile, {
    headerTitle: "Profil",
    animation: "slide_from_right",
  }),
  createScreen("SettingsAbout", SettingsAbout, {
    headerTitle: "À propos",
    animation: "slide_from_right",
  }),
  createScreen("SettingsIcons", SettingsIcons, {
    headerTitle: "Icônes",
    animation: "slide_from_right",
  }),
  createScreen("SettingsFlags", SettingsFlags, {
    headerTitle: "Flags (développeur)",
    animation: "slide_from_right",
  }),
  createScreen("SettingsFlagsInfos", SettingsFlagsInfos),

  createScreen("SettingsSubjects", SettingsSubjects, {
    headerTitle: "Matières",
    animation: "slide_from_right",
  }),
  createScreen("SettingsExternalServices", SettingsExternalServices, {
    headerTitle: "Services externes",
    animation: "slide_from_right",
  }),
  createScreen("SettingsMagic", SettingsMagic, {
    headerTitle: "Papillon Magic",
    animation: "slide_from_right",
  }),
  createScreen("SettingsAddons", SettingsAddons, {
    headerTitle: "Extensions",
    animation: "slide_from_right",
  }),
  createScreen("AddonPage", AddonPage, {
    headerTitle: "Extension",
    animation: "slide_from_right",
  }),

  createScreen("ExternalAccountSelectMethod", ExternalAccountSelectMethod, {
    headerTitle: "Connexion à un service externe",
    animation: "slide_from_right",
  }),

  createScreen("ExternalAccountSelector", ExternalAccountSelector, {
    headerTitle: "Configuration de la cantine",
    animation: "slide_from_right",
  }),

  createScreen("QrcodeAnswer", QrcodeAnswer, {
    headerTitle: "Configuration de la cantine",
    animation: "slide_from_right",
  }),

  createScreen("QrcodeScanner", QrcodeScanner, {
    headerTitle: "Configuration de la cantine",
    animation: "slide_from_right",
  }),

  createScreen("PriceDetectionOnboarding", PriceDetectionOnboarding, {
    headerTitle: "Configuration de la cantine",
    animation: "slide_from_right",
  }),

  createScreen("PriceBeforeScan", PriceBeforeScan, {
    headerTitle: "Configuration de la cantine",
    animation: "slide_from_right",
  }),

  createScreen("ExternalTurboselfLogin", ExternalTurboselfLogin, {
    headerTitle: "Connexion à Turboself",
    animation: "slide_from_right",
  }),
  createScreen("ExternalArdLogin", ExternalArdLogin, {
    headerTitle: "Connexion à ARD GEC",
  }),
  createScreen("ExternalIzlyLogin", ExternalIzlyLogin, {
    headerTitle: "Connexion à Izly",
    animation: "slide_from_right",
  }),

  createScreen("IzlyActivation", IzlyActivation, {
    headerTitle: "Configuration de la cantine",
    animation: "slide_from_right",
  }),

  createScreen("SettingsDevLogs", SettingsDevLogs, {
    headerTitle: "Logs",
    animation: "slide_from_right",
  }),

  createScreen("SettingsDonorsList", SettingsDonorsList, {
    headerTitle: "Donateurs",
    animation: "slide_from_right",
  }),
] as const;

export default settingsScreens;
