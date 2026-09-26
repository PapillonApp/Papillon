const fs = require("node:fs");
const path = require("node:path");

const plist = require("@expo/plist").default;
const { withFinalizedMod } = require("@expo/config-plugins");
const xcode = require("xcode");

// The widget extension is its own process and does not inherit the fonts
// `expo-font` registers at runtime in the app, so `font({ family })` inside a
// widget silently falls back to the system face. Copying the families into the
// extension target and listing them in its Info.plist is what makes them
// resolve.
//
// This runs as a finalized mod: by then expo-widgets has written the target and
// its Info.plist, so there is no ordering to guess at.
const TARGET_NAME = "ExpoWidgetsTarget";
const FONTS_GROUP = "Fonts";

function collectFonts(projectRoot) {
  const source = path.join(projectRoot, "assets", "fonts");
  if (!fs.existsSync(source)) {
    return [];
  }
  return fs
    .readdirSync(source)
    .filter(name => /\.(ttf|otf)$/i.test(name))
    .sort();
}

function copyFonts(projectRoot, fonts) {
  const destination = path.join(projectRoot, "ios", TARGET_NAME, FONTS_GROUP);
  fs.mkdirSync(destination, { recursive: true });

  for (const font of fonts) {
    fs.copyFileSync(
      path.join(projectRoot, "assets", "fonts", font),
      path.join(destination, font)
    );
  }
}

function findTargetUuid(project) {
  const targets = project.pbxNativeTargetSection();
  for (const [uuid, target] of Object.entries(targets)) {
    if (uuid.endsWith("_comment") || !target || typeof target !== "object") {
      continue;
    }
    if (String(target.name).replace(/"/g, "") === TARGET_NAME) {
      return uuid;
    }
  }
  return null;
}

function hasResourcesPhase(project, targetUuid) {
  const section = project.hash.project.objects.PBXResourcesBuildPhase;
  const target = project.pbxNativeTargetSection()[targetUuid];
  if (!section || !target || !target.buildPhases) {
    return false;
  }
  return target.buildPhases.some(phase => section[phase.value]);
}

function addFontsToProject(projectRoot, fonts) {
  const projectPath = path.join(
    projectRoot,
    "ios",
    "Papillon.xcodeproj",
    "project.pbxproj"
  );
  const project = xcode.project(projectPath);
  project.parseSync();

  const targetUuid = findTargetUuid(project);
  if (!targetUuid) {
    throw new Error(`Could not find the ${TARGET_NAME} target to add fonts to.`);
  }

  if (hasResourcesPhase(project, targetUuid)) {
    return false;
  }

  const fontPaths = fonts.map(font => path.join(TARGET_NAME, FONTS_GROUP, font));
  project.addBuildPhase(
    fontPaths,
    "PBXResourcesBuildPhase",
    "Resources",
    targetUuid,
    "app_extension",
    '""'
  );

  // The references are not filed under a PBXGroup, so `<group>` would resolve
  // against whatever Xcode picks as their parent. SOURCE_ROOT is the .xcodeproj
  // directory, which is exactly what the paths above are relative to.
  const references = project.hash.project.objects.PBXFileReference;
  for (const [key, reference] of Object.entries(references)) {
    if (key.endsWith("_comment") || typeof reference !== "object") {
      continue;
    }
    const filePath = String(reference.path).replace(/"/g, "");
    if (fontPaths.includes(filePath)) {
      reference.sourceTree = "SOURCE_ROOT";
    }
  }

  fs.writeFileSync(projectPath, project.writeSync());
  return true;
}

function addFontsToInfoPlist(projectRoot, fonts) {
  const infoPlistPath = path.join(projectRoot, "ios", TARGET_NAME, "Info.plist");
  if (!fs.existsSync(infoPlistPath)) {
    throw new Error(`Missing widget Info.plist at ${infoPlistPath}`);
  }

  const contents = plist.parse(fs.readFileSync(infoPlistPath, "utf8"));
  contents.UIAppFonts = fonts;
  fs.writeFileSync(infoPlistPath, plist.build(contents));
}

function withWidgetFonts(config) {
  return withFinalizedMod(config, [
    "ios",
    async modConfig => {
      const { projectRoot } = modConfig.modRequest;
      const fonts = collectFonts(projectRoot);

      if (fonts.length === 0) {
        return modConfig;
      }

      copyFonts(projectRoot, fonts);
      const added = addFontsToProject(projectRoot, fonts);
      addFontsToInfoPlist(projectRoot, fonts);

      console.log(
        added
          ? `Added ${fonts.length} fonts to the ${TARGET_NAME} target`
          : `${TARGET_NAME} already has a resources phase; refreshed its fonts`
      );

      return modConfig;
    },
  ]);
}

module.exports = withWidgetFonts;
module.exports.collectFonts = collectFonts;
module.exports.addFontsToProject = addFontsToProject;
