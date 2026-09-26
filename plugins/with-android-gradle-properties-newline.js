const fs = require("node:fs");
const path = require("node:path");

const { withFinalizedMod } = require("@expo/config-plugins");

function ensureTrailingNewline(projectRoot) {
  const gradlePropertiesPath = path.join(
    projectRoot,
    "android",
    "gradle.properties",
  );

  if (!fs.existsSync(gradlePropertiesPath)) {
    return;
  }

  const contents = fs.readFileSync(gradlePropertiesPath, "utf8");
  if (contents.length > 0 && !contents.endsWith("\n")) {
    fs.writeFileSync(gradlePropertiesPath, `${contents}\n`);
  }
}

function withAndroidGradlePropertiesNewline(config) {
  return withFinalizedMod(config, [
    "android",
    async modConfig => {
      ensureTrailingNewline(modConfig.modRequest.projectRoot);
      return modConfig;
    },
  ]);
}

module.exports = withAndroidGradlePropertiesNewline;
