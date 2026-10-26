#!/usr/bin/env node

const path = require("node:path");

const {
  restoreWearNativeFiles,
  snapshotWearNativeFiles,
} = require("../plugins/with-wear-os");

const projectRoot = path.resolve(__dirname, "..");
const command = process.argv[2];

if (command === "restore") {
  restoreWearNativeFiles(projectRoot);
} else if (command === "snapshot") {
  snapshotWearNativeFiles(projectRoot);
} else {
  process.stderr.write(
    "Usage: node scripts/wear-native-files.js <restore|snapshot>\n"
  );
  process.exitCode = 1;
}
