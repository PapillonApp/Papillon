import createScreen from "@/router/helpers/create-screen";

import PronoteAuthenticationSelector from "@/views/login/pronote/PronoteAuthenticationSelector";
import PronoteGeolocation from "@/views/login/pronote/PronoteGeolocation";
import PronoteInstanceSelector from "@/views/login/pronote/PronoteInstanceSelector";
import PronoteManualLocation from "@/views/login/pronote/PronoteManualLocation";
import PronoteCredentials from "@/views/login/pronote/PronoteCredentials";
import PronoteManualURL from "@/views/login/pronote/PronoteManualURL";
import PronoteQRCode from "@/views/login/pronote/PronoteQRCode";
import PronoteWebview from "@/views/login/pronote/PronoteWebview";
import PronoteV6Import from "@/views/login/pronote/PronoteV6Import";
import Pronote2FA_Auth from "@/views/login/pronote/Pronote2FA_Auth";


export default [
  createScreen("PronoteAuthenticationSelector", PronoteAuthenticationSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteGeolocation", PronoteGeolocation, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteInstanceSelector", PronoteInstanceSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteManualLocation", PronoteManualLocation, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteQRCode", PronoteQRCode, {
    headerTitle: "",
    headerTintColor: "white",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteCredentials", PronoteCredentials, {
    headerTitle: "Connexion à PRONOTE",
    headerBackVisible: true
  }),
  createScreen("PronoteManualURL", PronoteManualURL, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteWebview", PronoteWebview, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),
  createScreen("PronoteV6Import", PronoteV6Import, {
    headerTitle: "Importer d'une ancienne version",
    presentation: "modal",
  }),
  createScreen("Pronote2FA_Auth", Pronote2FA_Auth, {
    headerTitle: "Connexion à PRONOTE",
    headerBackVisible: true
  }),
] as const;
