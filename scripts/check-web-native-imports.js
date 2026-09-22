const fs = require("fs");
const path = require("path");

const roots = ["app", "components", "hooks", "modules", "services", "stores", "ui", "utils", "widgets"];
const nativePatterns = [/@expo\/ui(?:["'`]|\/)/, /from\s+["']@expo\/ui["']/];
const ignored = new Set(["node_modules", ".git", "dist", "web-build"]);
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name)) && !entry.name.endsWith(".native.ts") && !entry.name.endsWith(".native.tsx")) files.push(full);
  }
}
roots.forEach(walk);

const offenders = [];
for (const file of files) {
  // A file with a .web suffix is safe only if it does not itself import ExpoUI.
  const text = fs.readFileSync(file, "utf8");
  if (nativePatterns.some((re) => re.test(text))) {
    if (/\.web\.[tj]sx?$/.test(file)) offenders.push(file);
  }
}

if (offenders.length) {
  console.error("Native @expo/ui imports found in web-specific files:");
  offenders.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}
console.log("Web native-import guard passed.");
