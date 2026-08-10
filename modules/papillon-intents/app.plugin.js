"use strict";

const fs = require("fs");
const path = require("path");
const {
  withXcodeProject,
  withEntitlementsPlist,
  IOSConfig,
} = require("@expo/config-plugins");

const ts = require("typescript");
const { generateSwift } = require("./plugin/swiftgen");

const GENERATED_FILENAME = "_Generated.swift";
const CONFIG_CANDIDATES = [
  "papillon-intents.config.ts",
  "papillon-intents.config.js",
  "papillon-intents.config.mjs",
  "papillon-intents.config.json",
];

/** Resolve the consumer's config file (prop wins, else auto-discover at root). */
function resolveConfigPath(projectRoot, props) {
  if (props && props.config) {
    const p = path.resolve(projectRoot, props.config);
    if (!fs.existsSync(p)) {
      throw new Error(`[papillon-intents] config not found at "${p}".`);
    }
    return p;
  }
  for (const candidate of CONFIG_CANDIDATES) {
    const p = path.join(projectRoot, candidate);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    "[papillon-intents] no config found. Create `papillon-intents.config.ts` " +
      "at the project root, or pass `{ config: \"./path/to/config\" }` in the plugin props."
  );
}

const TS_OPTIONS = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2019,
  esModuleInterop: true,
};

/** Transpile a TS source string to CommonJS (in-memory, no emit). */
function transpileTS(source) {
  return ts.transpileModule(source, { compilerOptions: TS_OPTIONS }).outputText;
}

let tsRequireInstalled = false;

/**
 * Make Node resolve + compile `.ts` files on demand and honor the consumer's
 * tsconfig `paths` alias (`@/` -> project root). Needed because the config
 * file may import sibling `.ts` modules (e.g. `intents/entities.ts`) that the
 * plain CJS loader cannot resolve.
 */
function installTSRequire(projectRoot) {
  if (tsRequireInstalled) return;
  tsRequireInstalled = true;

  const Module = require("module");
  Module._extensions[".ts"] = function (module, filename) {
    module._compile(transpileTS(fs.readFileSync(filename, "utf8")), filename);
  };

  const origResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, options) {
    if (typeof request === "string" && request.startsWith("@/")) {
      request = path.join(projectRoot, request.slice(2));
    }
    return origResolveFilename.call(this, request, parent, isMain, options);
  };
}

/** Load + evaluate the config file (TS is transpiled in-memory). */
function loadConfig(configPath) {
  const Module = require("module");
  const ext = path.extname(configPath);
  let source = fs.readFileSync(configPath, "utf8");

  if (ext === ".json") {
    return JSON.parse(source);
  }

  if (ext === ".ts") {
    installTSRequire(path.dirname(configPath));
    source = transpileTS(source);
  }

  const m = new Module(configPath, module);
  m.filename = configPath;
  m.paths = Module._nodeModulePaths(path.dirname(configPath));
  m._compile(source, configPath);

  const exported = m.exports;
  return exported && exported.default ? exported.default : exported;
}

function withGeneratedIntents(config, papillonConfig) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const iosRoot = cfg.modRequest.platformProjectRoot;
    const projectName =
      cfg.modRequest.projectName ||
      IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);

    const relDir = `${projectName}/PapillonIntents`;
    const relPath = `${relDir}/${GENERATED_FILENAME}`;
    const absDir = path.join(iosRoot, relDir);

    fs.mkdirSync(absDir, { recursive: true });
    fs.writeFileSync(path.join(iosRoot, relPath), generateSwift(papillonConfig), "utf8");

    if (typeof project.hasFile === "function" && project.hasFile(relPath)) {
      return cfg;
    }

    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: relPath,
      groupName: relDir,
      project,
    });

    return cfg;
  });
}

function withAppGroupEntitlement(config, appGroup) {
  return withEntitlementsPlist(config, (cfg) => {
    const key = "com.apple.security.application-groups";
    const existing = Array.isArray(cfg.modResults[key]) ? cfg.modResults[key] : [];
    if (!existing.includes(appGroup)) {
      cfg.modResults[key] = [...existing, appGroup];
    }
    return cfg;
  });
}

/**
 * Config plugin entry. Generates the Swift App Intents from the consumer's
 * `papillon-intents.config.*` (project root) and wires them into the iOS app.
 *
 * Usage in app.json / app.config.js:
 *   plugins: ["papillon-intents"]
 *   // or with an explicit path:
 *   plugins: [["papillon-intents", { config: "./config/intents.ts" }]]
 */
module.exports = function withPapillonIntents(config, props) {
  const projectRoot =
    (config._internal && config._internal.projectRoot) || process.cwd();

  const configPath = resolveConfigPath(projectRoot, props);
  const papillonConfig = loadConfig(configPath);

  config = withGeneratedIntents(config, papillonConfig);

  const settings = papillonConfig.settings || {};
  const cacheEnabled = !settings.cache || settings.cache.enabled !== false;
  if (settings.appGroup && cacheEnabled) {
    config = withAppGroupEntitlement(config, settings.appGroup);
  }

  return config;
};
