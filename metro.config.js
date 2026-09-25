/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
// Learn more https://docs.expo.io/guides/customizing-metro

const path = require("path");
const exclusionList = require("metro-config/private/defaults/exclusionList").default;
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const rootNodeModules = path.resolve(__dirname, "node_modules");
const nestedSvgModules = [
  path.resolve(rootNodeModules, "@aramir/react-native-barcode/node_modules/react-native-svg"),
  path.resolve(rootNodeModules, "@getpapillon/papicons/node_modules/react-native-svg"),
];

const escapePath = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

config.resolver.assetExts.push("tflite", "json", "txt");
config.resolver.blockList = exclusionList(
  nestedSvgModules.map((modulePath) => new RegExp(`${escapePath(modulePath)}\\/.*`)),
);
config.resolver.extraNodeModules = {
  "react-native-svg": path.resolve(rootNodeModules, "react-native-svg"),
};

// --- Build desktop (web via react-native-web -> Tauri) -------------------
// Certains modules sont strictement natifs (iOS/Android) et n'ont pas
// d'équivalent web : on les redirige vers un shim local uniquement quand on
// bundle pour la plateforme "web". iOS/Android ne sont jamais impactés.
const WEB_ONLY_SHIMS = {
  "react-native-fast-tflite": path.resolve(__dirname, "web-shims/react-native-fast-tflite.web.ts"),
  // esup-multi.js@1.0.4 a un package.json cassé : son champ "module" pointe
  // vers dist/index.mjs, qui n'existe pas dans le paquet publié (seul
  // dist/index.js en CommonJS existe réellement). Metro choisit le champ
  // "module" en mode web et échoue. On le redirige directement vers le vrai
  // fichier CJS (qui ne dépend d'aucune API Node) : la connexion ESUP reste
  // fonctionnelle sur desktop, ce n'est pas une limitation native.
  "esup-multi.js": path.resolve(rootNodeModules, "esup-multi.js/dist/index.js"),
  "@react-native-community/datetimepicker": path.resolve(
    __dirname,
    "web-shims/react-native-community-datetimepicker.web.tsx",
  ),
  "react-native-linear-gradient": path.resolve(__dirname, "web-shims/react-native-linear-gradient.web.tsx"),
  "react-native-webview": path.resolve(__dirname, "web-shims/react-native-webview.web.tsx"),
  "react-native-dynamic-theme": path.resolve(__dirname, "web-shims/react-native-dynamic-theme.web.ts"),
};

const { resolveRequest: defaultResolveRequest } = config.resolver;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && Object.prototype.hasOwnProperty.call(WEB_ONLY_SHIMS, moduleName)) {
    return context.resolveRequest(context, WEB_ONLY_SHIMS[moduleName], platform);
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
