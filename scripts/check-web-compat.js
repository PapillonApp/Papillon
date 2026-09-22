const fs = require("fs");
const path = require("path");

const roots = ["app", "components", "ui", "utils"];
const extensions = new Set([".ts", ".tsx"]);
const ignored = new Set(["node_modules", ".git", "dist"]);
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
}
roots.forEach(walk);

const badVariants = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const re = /variant=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1] === "body") badVariants.push(`${path.relative(process.cwd(), file)}:${text.slice(0, m.index).split(/\r?\n/).length}`);
  }
}

if (badVariants.length) {
  console.error('Invalid Typography variant "body" found (use "body1" or "body2"):');
  badVariants.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}

if (!fs.existsSync("src-tauri/capabilities/default.json")) {
  console.error("Missing src-tauri/capabilities/default.json");
  process.exit(1);
}

console.log("Web/Tauri compatibility guard passed.");
