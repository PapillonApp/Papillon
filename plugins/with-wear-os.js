const fs = require("node:fs");
const path = require("node:path");

const {
  withFinalizedMod,
  withSettingsGradle,
} = require("@expo/config-plugins");

const IGNORED_DIRS = new Set(["build", ".cxx", ".gradle"]);

function copyDirectoryRecursive(sourceDir, destinationDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing Wear OS directory: ${sourceDir}`);
  }

  fs.mkdirSync(destinationDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      fs.chmodSync(destPath, fs.statSync(srcPath).mode);
    }
  }
}

function ensureWearIncludedInSettingsGradle(settingsContents) {
  if (
    settingsContents.includes("include ':wear'") ||
    settingsContents.includes('include(":wear")')
  ) {
    return settingsContents;
  }

  const trimmed = settingsContents.trimEnd();
  return `${trimmed}\n\ninclude ':wear'\n`;
}

function restoreWearNativeFiles(projectRoot) {
  const sourceDir = path.join(projectRoot, "native", "wear");
  const destinationDir = path.join(projectRoot, "android", "wear");
  copyDirectoryRecursive(sourceDir, destinationDir);

  const settingsGradlePath = path.join(
    projectRoot,
    "android",
    "settings.gradle"
  );
  if (fs.existsSync(settingsGradlePath)) {
    const current = fs.readFileSync(settingsGradlePath, "utf8");
    const updated = ensureWearIncludedInSettingsGradle(current);
    if (updated !== current) {
      fs.writeFileSync(settingsGradlePath, updated);
    }
  }
}

function snapshotWearNativeFiles(projectRoot) {
  const sourceDir = path.join(projectRoot, "android", "wear");
  const destinationDir = path.join(projectRoot, "native", "wear");
  copyDirectoryRecursive(sourceDir, destinationDir);
}

function withWearOs(config) {
  const withSettings = withSettingsGradle(config, modConfig => {
    modConfig.modResults.contents = ensureWearIncludedInSettingsGradle(
      modConfig.modResults.contents
    );
    return modConfig;
  });

  return withFinalizedMod(withSettings, [
    "android",
    async modConfig => {
      restoreWearNativeFiles(modConfig.modRequest.projectRoot);
      return modConfig;
    },
  ]);
}

module.exports = withWearOs;
module.exports.restoreWearNativeFiles = restoreWearNativeFiles;
module.exports.snapshotWearNativeFiles = snapshotWearNativeFiles;
module.exports.ensureWearIncludedInSettingsGradle =
  ensureWearIncludedInSettingsGradle;
