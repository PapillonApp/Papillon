#!/usr/bin/env node
/* eslint-disable no-undef */
// Find asset files under ./assets not referenced (by basename or relative path) anywhere in source.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const assetsDir = path.join(root, "assets");

function listFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(listFiles(full));
    else out.push(full);
  }
  return out;
}

const files = listFiles(assetsDir);

// Grep whole repo (excluding assets/node_modules/ios/android build dirs) once for speed via ripgrep-like approach.
const searchDirs = ["app", "components", "ui", "utils", "services", "stores", "database", "hooks", "constants", "modules", "plugins", "app.config.ts", "papillon-intents.config.ts"].filter((d) =>
  fs.existsSync(path.join(root, d)),
);
const grepBase = `grep -rlF --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.jsx" --include="*.plist"`;

const unused = [];
for (const file of files) {
  const base = path.basename(file);
  const rel = path.relative(root, file);
  // RN resolves @2x/@3x density variants automatically from the base filename,
  // so search using the base name with any density suffix stripped.
  const needle = base.replace(/@[123]x(?=\.\w+$)/, "");
  let found = false;
  try {
    const cmd = `${grepBase} -- "${needle.replace(/"/g, '\\"')}" ${searchDirs.map((d) => `"${d}"`).join(" ")} 2>/dev/null`;
    const res = execSync(cmd, { cwd: root, encoding: "utf8" });
    found = res.trim().length > 0;
  } catch (e) {
    found = Boolean(e.stdout && e.stdout.trim().length > 0);
  }
  if (!found) unused.push(rel);
}

console.log(`Checked ${files.length} asset files.`);
console.log(`Potentially unused (${unused.length}):`);
for (const u of unused) console.log(" -", u);
