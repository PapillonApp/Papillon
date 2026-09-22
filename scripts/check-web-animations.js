const fs = require("fs");
const path = require("path");

const roots = ["app", "components", "hooks", "modules", "services", "stores", "ui", "utils", "widgets"];
const ignored = new Set(["node_modules", ".git", "dist", "web-build"]);
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const allowed = new Set([
  path.normalize("ui/utils/Animation.ts"),
  path.normalize("ui/utils/Transition.ts"),
]);

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
  const rel = path.relative(process.cwd(), file);
  if (allowed.has(path.normalize(rel))) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!/springify\s*\(/.test(lines[i])) continue;
    const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(" ");
    if (/entering\s*=|exiting\s*=|layout\s*=/.test(context)) {
      offenders.push(`${rel}:${i + 1}`);
    }
  }
}

if (offenders.length) {
  console.error("Potentially unsupported springify() usage in Web entering/exiting/layout animations:");
  offenders.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}
console.log("Web animation guard passed: no direct springified entering/exiting/layout animation was found.");
