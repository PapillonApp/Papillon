const fs = require("fs");
const path = require("path");

const dist = path.resolve("dist");
const pattern = /requireNativeModule\(["']ExpoUI["']\)/;

if (!fs.existsSync(dist)) {
  console.error("Web export directory not found: dist");
  process.exit(1);
}

let offenders = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(js|mjs|cjs)$/.test(entry.name)) {
      const text = fs.readFileSync(file, "utf8");
      if (pattern.test(text)) offenders.push(path.relative(process.cwd(), file));
    }
  }
}
walk(dist);

if (offenders.length) {
  console.error("The web export still contains a runtime ExpoUI native-module lookup:");
  offenders.forEach((file) => console.error(` - ${file}`));
  process.exit(1);
}

console.log("Web bundle check passed: no ExpoUI native-module lookup found.");
