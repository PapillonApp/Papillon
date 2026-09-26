#!/usr/bin/env node

const path = require("node:path");

const {
  restoreIosNativeFiles,
  snapshotIosNativeFiles,
} = require("../plugins/with-ios-native-files");

const projectRoot = path.resolve(__dirname, "..");
const command = process.argv[2];

if (command === "restore") {
  restoreIosNativeFiles(projectRoot);
  console.log("Restored ios/Podfile and ios/ci_scripts from native/ios");
} else if (command === "snapshot") {
  snapshotIosNativeFiles(projectRoot);
  console.log("Updated native/ios from ios/Podfile and ios/ci_scripts");
} else {
  console.error("Usage: node scripts/ios-native-files.js <restore|snapshot>");
  process.exitCode = 1;
}
