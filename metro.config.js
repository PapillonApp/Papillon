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

module.exports = config;
