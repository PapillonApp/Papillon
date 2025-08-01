/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
// Learn more https://docs.expo.io/guides/customizing-metro

const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("tflite", "json");

module.exports = config;
