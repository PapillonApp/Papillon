/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
// Learn more https://docs.expo.io/guides/customizing-metro

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const projectNodeModules = path.resolve(__dirname, "node_modules");

config.resolver.assetExts.push("tflite", "json", "txt");
config.resolver.extraNodeModules = {
	...(config.resolver.extraNodeModules ?? {}),
	"react-native": path.resolve(projectNodeModules, "react-native"),
	"react-native-svg": path.resolve(__dirname, "node_modules/react-native-svg"),
};

module.exports = config;
