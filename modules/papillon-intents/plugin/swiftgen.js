"use strict";

/**
 * Swift code generator for the papillon-intents config plugin.
 * Produces `_Generated.swift`: one rich AppEntity + AppIntent per config entry,
 * plus the AppShortcutsProvider. Lives in the MAIN app target and reaches the
 * pod's public bridge/store via `import PapillonIntents`.
 *
 * NOTE: Swift string interpolation `\(...)` must be emitted as `\\(` in JS
 * source. The `I()` helper centralizes that.
 */

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
/** Swift interpolation: I("count") -> `\(count)`. */
const I = (expr) => "\\(" + expr + ")";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const isOptional = (t) => t.endsWith("?");
const baseType = (t) => (isOptional(t) ? t.slice(0, -1) : t);

function swiftType(propType) {
  switch (baseType(propType)) {
    case "string":
      return "String" + (isOptional(propType) ? "?" : "");
    case "number":
      return "Double" + (isOptional(propType) ? "?" : "");
    case "bool":
      return "Bool" + (isOptional(propType) ? "?" : "");
    case "date":
      return "Date" + (isOptional(propType) ? "?" : "");
    default:
      return "String";
  }
}

/** Assignment line inside `init(from dict:)`. */
function decodeLine(name, propType) {
  const k = `dict["${name}"]`;
  if (name === "id") {
    return `    self.id = (${k} as? String) ?? UUID().uuidString`;
  }
  switch (baseType(propType)) {
    case "string":
      return isOptional(propType)
        ? `    self.${name} = ${k} as? String`
        : `    self.${name} = (${k} as? String) ?? ""`;
    case "number":
      return isOptional(propType)
        ? `    self.${name} = (${k} as? NSNumber)?.doubleValue ?? (${k} as? Double)`
        : `    self.${name} = (${k} as? NSNumber)?.doubleValue ?? (${k} as? Double) ?? 0`;
    case "bool":
      return isOptional(propType)
        ? `    self.${name} = ${k} as? Bool`
        : `    self.${name} = (${k} as? Bool) ?? false`;
    case "date":
      return isOptional(propType)
        ? `    self.${name} = PapillonGen.parseDate(${k})`
        : `    self.${name} = PapillonGen.parseDate(${k}) ?? Date()`;
    default:
      return `    self.${name} = ${k} as? String`;
  }
}

/** String expression for a field (used for title/subtitle), honoring optionals. */
function stringExpr(accessor, propType) {
  switch (baseType(propType)) {
    case "string":
      return isOptional(propType) ? `(${accessor} ?? "")` : accessor;
    case "number":
    case "bool":
      return isOptional(propType)
        ? `(${accessor}.map { String($0) } ?? "")`
        : `String(${accessor})`;
    case "date":
      return isOptional(propType)
        ? `(${accessor}.map { PapillonGen.iso($0) } ?? "")`
        : `PapillonGen.iso(${accessor})`;
    default:
      return `"\\(${accessor})"`;
  }
}

function generateEntity(key, entity) {
  const name = `${entity.typeName}Entity`;
  const props = entity.properties || {};
  const lines = [];

  lines.push(`@available(iOS 16.0, *)`);
  lines.push(`struct ${name}: AppEntity {`);
  lines.push(
    `  static var typeDisplayRepresentation: TypeDisplayRepresentation { TypeDisplayRepresentation(name: "${esc(
      entity.typeDisplayName
    )}") }`
  );
  lines.push(`  static var defaultQuery = ${name}Query()`);
  lines.push("");

  // Stored properties (id is plain; others are @Property).
  for (const [pname, pdef] of Object.entries(props)) {
    if (pname === "id") {
      lines.push(`  var id: String`);
    } else {
      const title = pdef.title || pname;
      lines.push(`  @Property(title: "${esc(title)}") var ${pname}: ${swiftType(pdef.type)}`);
    }
  }
  if (!props.id) lines.push(`  var id: String`);
  lines.push("");

  // init(from dict:)
  lines.push(`  init(from dict: [String: Any]) {`);
  if (!props.id) lines.push(decodeLine("id", "string"));
  for (const [pname, pdef] of Object.entries(props)) {
    lines.push(decodeLine(pname, pdef.type));
  }
  lines.push(`  }`);
  lines.push("");

  // Display strings
  const titleField = entity.display.title;
  lines.push(
    `  private var papillonDisplayTitle: String { ${stringExpr(
      `self.${titleField}`,
      props[titleField] ? props[titleField].type : "string"
    )} }`
  );
  let subtitlePart = "";
  if (entity.display.subtitle) {
    const sf = entity.display.subtitle;
    lines.push(
      `  private var papillonDisplaySubtitle: String { ${stringExpr(
        `self.${sf}`,
        props[sf] ? props[sf].type : "string"
      )} }`
    );
    subtitlePart = `, subtitle: "${I("papillonDisplaySubtitle")}"`;
  }

  // Image
  let imagePart = "";
  const img = entity.display.image;
  if (img) {
    if (img.systemImage) {
      imagePart = `, image: .init(systemName: "${esc(img.systemImage)}")`;
    } else if (img.systemImageField) {
      const f = img.systemImageField;
      imagePart = `, image: .init(systemName: ${stringExpr(
        `self.${f}`,
        props[f] ? props[f].type : "string"
      )})`;
    } else if (img.urlField) {
      const f = img.urlField;
      imagePart = `, image: .init(url: URL(string: ${stringExpr(
        `self.${f}`,
        props[f] ? props[f].type : "string"
      )}))`;
    }
  }

  lines.push("");
  lines.push(`  var displayRepresentation: DisplayRepresentation {`);
  lines.push(
    `    DisplayRepresentation(title: "${I("papillonDisplayTitle")}"${subtitlePart}${imagePart})`
  );
  lines.push(`  }`);
  lines.push(`}`);
  lines.push("");

  // Query
  const searchable = Object.entries(props).filter(
    ([, d]) => d.searchable && baseType(d.type) === "string"
  );
  const useStringQuery = (entity.stringQueryProperties && entity.stringQueryProperties.length > 0) || searchable.length > 0;
  const proto = useStringQuery ? "EntityStringQuery" : "EntityQuery";

  lines.push(`@available(iOS 16.0, *)`);
  lines.push(`struct ${name}Query: ${proto} {`);
  lines.push(`  func entities(for identifiers: [String]) async throws -> [${name}] {`);
  lines.push(`    let ids = Set(identifiers)`);
  lines.push(
    `    return PapillonEntityStore.shared.loadArray(type: "${key}").map(${name}.init(from:)).filter { ids.contains($0.id) }`
  );
  lines.push(`  }`);
  lines.push(`  func suggestedEntities() async throws -> [${name}] {`);
  lines.push(`    PapillonEntityStore.shared.loadArray(type: "${key}").map(${name}.init(from:))`);
  lines.push(`  }`);
  if (useStringQuery) {
    const fields =
      entity.stringQueryProperties && entity.stringQueryProperties.length > 0
        ? entity.stringQueryProperties
        : searchable.map(([n]) => n);
    const conds = fields
      .map((f) => {
        const opt = props[f] && isOptional(props[f].type);
        const acc = opt ? `($0.${f} ?? "")` : `$0.${f}`;
        return `${acc}.lowercased().contains(q)`;
      })
      .join(" || ");
    lines.push(`  func entities(matching string: String) async throws -> [${name}] {`);
    lines.push(`    let q = string.lowercased()`);
    lines.push(
      `    return PapillonEntityStore.shared.loadArray(type: "${key}").map(${name}.init(from:)).filter { ${
        conds || "true"
      } }`
    );
    lines.push(`  }`);
  }
  lines.push(`}`);
  lines.push("");

  return lines.join("\n");
}

function paramSwiftType(p, entities) {
  switch (p.type) {
    case "number":
      return "Double";
    case "bool":
      return "Bool";
    case "date":
      return "Date";
    case "entity": {
      const e = entities[p.entity];
      return `${e.typeName}Entity`;
    }
    case "enum":
    case "string":
    default:
      return "String";
  }
}

function generateIntent(intent, entities, defaultTimeout) {
  const structName = `${cap(intent.id)}Intent`;
  const timeout = intent.timeoutMs || defaultTimeout || 25000;
  const lines = [];

  lines.push(`@available(iOS 16.0, *)`);
  lines.push(`struct ${structName}: AppIntent {`);
  lines.push(`  static var title: LocalizedStringResource = "${esc(intent.title)}"`);
  if (intent.description) {
    lines.push(`  static var description = IntentDescription("${esc(intent.description)}")`);
  }
  lines.push(`  static var openAppWhenRun: Bool = ${intent.openAppWhenRun ? "true" : "false"}`);
  lines.push("");

  const params = intent.parameters || [];
  for (const p of params) {
    const opt = p.optional ? "?" : "";
    lines.push(`  @Parameter(title: "${esc(p.title)}") var ${p.name}: ${paramSwiftType(p, entities)}${opt}`);
  }
  if (params.length) lines.push("");

  // perform()
  const r = intent.returns;
  let sig;
  const entityName = (r.entity && entities[r.entity]) ? `${entities[r.entity].typeName}Entity` : null;
  if (r.type === "entityList") sig = `some IntentResult & ReturnsValue<[${entityName}]>`;
  else if (r.type === "entity") sig = `some IntentResult & ReturnsValue<${entityName}>`;
  else if (r.type === "value") sig = `some IntentResult & ReturnsValue<String>`;
  else sig = `some IntentResult & ProvidesDialog`;
  if (r.dialog && r.type !== "dialog") sig += " & ProvidesDialog";

  lines.push(`  func perform() async throws -> ${sig} {`);
  lines.push(`    var params: [String: Any] = [:]`);
  if (intent.requiresAuth) lines.push(`    params["__requiresAuth"] = true`);
  for (const p of params) {
    const conv = (v) =>
      p.type === "date" ? `PapillonGen.iso(${v})` : p.type === "entity" ? `${v}.id` : v;
    if (p.optional) {
      lines.push(`    if let v = ${p.name} { params["${p.name}"] = ${conv("v")} }`);
    } else {
      lines.push(`    params["${p.name}"] = ${conv(p.name)}`);
    }
  }
  lines.push(
    `    let json = try await PapillonIntentsBridge.shared.fetch(action: "${esc(
      intent.action
    )}", params: params, timeoutMs: ${timeout})`
  );

  if (r.type === "entityList") {
    lines.push(`    PapillonEntityStore.shared.save(type: "${r.entity}", json: json)`);
    lines.push(`    let entities = PapillonGen.parseArray(json).map(${entityName}.init(from:))`);
    if (r.dialog) {
      lines.push(`    let count = entities.count`);
      lines.push(`    return .result(value: entities, dialog: "${dialogLiteral(r.dialog, true)}")`);
    } else {
      lines.push(`    return .result(value: entities)`);
    }
  } else if (r.type === "entity") {
    lines.push(`    PapillonEntityStore.shared.save(type: "${r.entity}", json: json)`);
    lines.push(
      `    guard let first = PapillonGen.parseArray(json).map(${entityName}.init(from:)).first else {`
    );
    lines.push(`      throw PapillonIntentsBridge.BridgeError.rejected("Aucun résultat.")`);
    lines.push(`    }`);
    if (r.dialog) {
      lines.push(`    return .result(value: first, dialog: "${dialogLiteral(r.dialog, false)}")`);
    } else {
      lines.push(`    return .result(value: first)`);
    }
  } else if (r.type === "value") {
    if (r.dialog) {
      lines.push(`    return .result(value: json, dialog: "${dialogLiteral(r.dialog, false)}")`);
    } else {
      lines.push(`    return .result(value: json)`);
    }
  } else {
    // dialog only
    lines.push(`    return .result(dialog: "${dialogLiteral(r.dialog, false)}")`);
  }

  lines.push(`  }`);
  lines.push(`}`);
  lines.push("");
  return lines.join("\n");
}

function dialogLiteral(template, hasCount) {
  let out = esc(template);
  out = out.split("${count}").join(hasCount ? I("count") : "");
  return out;
}

function generateShortcuts(intents) {
  const withPhrases = intents.filter((i) => i.phrases && i.phrases.length > 0);
  if (!withPhrases.length) return "";

  const lines = [];
  lines.push(`@available(iOS 16.0, *)`);
  lines.push(`struct PapillonAppShortcuts: AppShortcutsProvider {`);
  lines.push(`  static var appShortcuts: [AppShortcut] {`);
  for (const intent of withPhrases) {
    const structName = `${cap(intent.id)}Intent`;
    const phrases = intent.phrases
      .map((p) => `      "${esc(p).split("${applicationName}").join(I(".applicationName"))}"`)
      .join(",\n");
    const shortTitle = esc(intent.shortTitle || intent.title);
    const sysImage = esc(intent.systemImage || "app");
    lines.push(`    AppShortcut(`);
    lines.push(`      intent: ${structName}(),`);
    lines.push(`      phrases: [`);
    lines.push(phrases);
    lines.push(`      ],`);
    lines.push(`      shortTitle: "${shortTitle}",`);
    lines.push(`      systemImageName: "${sysImage}"`);
    lines.push(`    )`);
  }
  lines.push(`  }`);
  lines.push(`}`);
  lines.push("");
  return lines.join("\n");
}

function generateSwift(config) {
  const entities = config.entities || {};
  const intents = config.intents || [];
  const defaultTimeout = (config.settings && config.settings.defaultTimeoutMs) || 25000;

  const parts = [];
  parts.push(`// AUTO-GENERATED by the papillon-intents config plugin. DO NOT EDIT.`);
  parts.push(`// Edit modules/papillon-intents/papillon-intents.config.ts then re-run \`expo prebuild\`.`);
  parts.push(`import AppIntents`);
  parts.push(`import Foundation`);
  // Explicit access level: under Swift 6 (AccessLevelOnImport) the pod is
  // imported as `internal` by Expo's generated provider, so an implicit import
  // here is ambiguous. Match it explicitly.
  parts.push(`internal import PapillonIntents`);
  parts.push("");
  parts.push(`@available(iOS 16.0, *)`);
  parts.push(`enum PapillonGen {`);
  parts.push(`  static func parseArray(_ json: String) -> [[String: Any]] {`);
  parts.push(`    guard let data = json.data(using: .utf8),`);
  parts.push(`          let arr = (try? JSONSerialization.jsonObject(with: data)) as? [[String: Any]] else { return [] }`);
  parts.push(`    return arr`);
  parts.push(`  }`);
  parts.push(`  static let isoFormatter: ISO8601DateFormatter = {`);
  parts.push(`    let f = ISO8601DateFormatter()`);
  parts.push(`    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]`);
  parts.push(`    return f`);
  parts.push(`  }()`);
  parts.push(`  static func parseDate(_ any: Any?) -> Date? {`);
  parts.push(`    if let s = any as? String { return isoFormatter.date(from: s) ?? ISO8601DateFormatter().date(from: s) }`);
  parts.push(`    if let n = any as? NSNumber { return Date(timeIntervalSince1970: n.doubleValue) }`);
  parts.push(`    return nil`);
  parts.push(`  }`);
  parts.push(`  static func iso(_ date: Date) -> String { isoFormatter.string(from: date) }`);
  parts.push(`}`);
  parts.push("");

  for (const [key, entity] of Object.entries(entities)) {
    parts.push(generateEntity(key, entity));
  }
  for (const intent of intents) {
    parts.push(generateIntent(intent, entities, defaultTimeout));
  }
  parts.push(generateShortcuts(intents));

  return parts.join("\n");
}

module.exports = { generateSwift };
