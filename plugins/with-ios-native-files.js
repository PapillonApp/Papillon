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

function restoreIosNativeFiles(projectRoot) {
  copyManagedFiles(projectRoot, path.join("native", "ios"), "ios");
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
