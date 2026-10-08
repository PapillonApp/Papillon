const fs = require("node:fs");
const path = require("node:path");

const { withFinalizedMod } = require("@expo/config-plugins");

const MANAGED_FILES = ["Podfile", path.join("ci_scripts", "ci_post_clone.sh")];

function copyManagedFiles(projectRoot, fromDirectory, toDirectory) {
  for (const relativePath of MANAGED_FILES) {
    const source = path.join(projectRoot, fromDirectory, relativePath);
    const destination = path.join(projectRoot, toDirectory, relativePath);

    if (!fs.existsSync(source)) {
      throw new Error(`Missing protected iOS file: ${source}`);
    }

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    fs.chmodSync(destination, fs.statSync(source).mode);
  }
}

function ensureAppIcon(projectRoot) {
  const sourceIcon = path.join(projectRoot, "assets", "app.icon");
  const destIcon = path.join(projectRoot, "ios", "Papillon", "app.icon");
  if (fs.existsSync(sourceIcon)) {
    fs.mkdirSync(path.dirname(destIcon), { recursive: true });
    fs.cpSync(sourceIcon, destIcon, { recursive: true });
  }
}

function restoreIosNativeFiles(projectRoot) {
  copyManagedFiles(projectRoot, path.join("native", "ios"), "ios");
  ensureAppIcon(projectRoot);
}

function snapshotIosNativeFiles(projectRoot) {
  copyManagedFiles(projectRoot, "ios", path.join("native", "ios"));
}

function withIosNativeFiles(config) {
  return withFinalizedMod(config, [
    "ios",
    async modConfig => {
      restoreIosNativeFiles(modConfig.modRequest.projectRoot);
      console.log("Restored protected Podfile and Xcode Cloud scripts");
      return modConfig;
    },
  ]);
}

module.exports = withIosNativeFiles;
module.exports.restoreIosNativeFiles = restoreIosNativeFiles;
module.exports.snapshotIosNativeFiles = snapshotIosNativeFiles;
