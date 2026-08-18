const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const outputDir = path.join(__dirname, "..", "ios", "PapillonKit", "Database", "NativeDB", "Generated");
const tablesToKeep = ["Courses.swift", "Homework.swift", "Grades.swift"];

const { generateNativeDBSchemaFiles } = require(path.join(repoRoot, "database/native/dist/schema"));
const { generateNativeDBConstantsFile } = require(path.join(repoRoot, "database/native/dist/constants"));

const constants = generateNativeDBConstantsFile(path.join(repoRoot, "database/index.ts"));
const schemas = generateNativeDBSchemaFiles(path.join(repoRoot, "database/schema.ts"));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, constants.filename), constants.content + "\n");

for (const file of schemas) {
  if (!tablesToKeep.includes(file.filename)) { continue; }
  fs.writeFileSync(path.join(outputDir, file.filename), file.content + "\n");
  console.log(`Generated ${file.filename}`);
}
