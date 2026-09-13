#!/usr/bin/env node
/* eslint-disable no-undef */
// A 'widget' layout is serialized to a string and re-evaluated inside the
// WidgetKit extension, which only has the globals expo-widgets injects. Any
// other identifier it ends up referencing — an import, a module constant, or a
// Babel helper quietly added by a transform such as array destructuring —
// throws at render time and shows an empty widget with nothing in the app logs.
// This walks every layout after Babel and fails on identifiers the widget
// runtime cannot provide.
// Pass `--render <file> [propsJson] [environmentJson]` to evaluate one layout
// against the real widget bundle and print the node tree native would render,
// resolved modifiers included. That is the only way to see what a widget will
// actually draw without a full native rebuild.
const babel = require("@babel/core");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const widgetsDir = path.join(root, "widgets");

// Injected by expo-widgets/bundle/index.ts.
const RUNTIME_STUBS = [
  "Fragment", "_Fragment", "_jsxFileName", "jsxProd", "jsx", "jsxs", "jsxDEV",
  "_jsx", "_jsxs", "_jsxDEV", "Children", "isValidElement", "createContext",
  "useContext", "React", "PlatformColor",
];

const JS_BUILTINS = [
  "Math", "JSON", "Date", "Object", "Array", "String", "Number", "Boolean",
  "parseInt", "parseFloat", "isNaN", "RegExp", "Map", "Set", "Error", "Intl",
  "undefined", "NaN", "Infinity", "globalThis", "console",
];

function expoUiExports() {
  const base = path.join(
    path.dirname(require.resolve("expo-widgets/package.json")),
    "node_modules/@expo/ui/build/swift-ui"
  );
  const dir = fs.existsSync(base)
    ? base
    : path.join(path.dirname(require.resolve("@expo/ui/package.json")), "build/swift-ui");

  const names = new Set();
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".d.ts")) {
        const source = fs.readFileSync(full, "utf8");
        for (const [, name] of source.matchAll(
          /^export declare (?:function|const|class|let|var)\s+([A-Za-z_$][\w$]*)/gm
        )) {
          names.add(name);
        }
        for (const [, group] of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
          for (const part of group.split(",")) {
            const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop();
            if (name && /^[A-Za-z_$][\w$]*$/.test(name)) {
              names.add(name);
            }
          }
        }
      }
    }
  };
  walk(dir);
  return names;
}

function layoutsIn(file) {
  const { code } = babel.transformFileSync(file, {
    filename: file,
    presets: [["babel-preset-expo", { unstable_transformProfile: "hermes-v0" }]],
    caller: { name: "metro", platform: "ios", bundler: "metro", isDev: false, supportsStaticESM: false },
    babelrc: false,
    configFile: false,
  });

  const layouts = [];
  traverse(babel.parseSync(code, { babelrc: false, configFile: false }), {
    TemplateLiteral(nodePath) {
      const raw = nodePath.node.quasis[0]?.value.cooked ?? "";
      if (nodePath.node.quasis.length === 1 && /^function\s*\(/.test(raw)) {
        layouts.push(raw);
      }
    },
  });
  return layouts;
}

function freeIdentifiers(source) {
  const names = new Set();
  traverse(parser.parse(`(${source})`, { sourceType: "script" }), {
    ReferencedIdentifier(nodePath) {
      if (!nodePath.scope.hasBinding(nodePath.node.name, { noGlobals: true })) {
        names.add(nodePath.node.name);
      }
    },
  });
  return names;
}

function render(file, props, environment) {
  const vm = require("vm");
  const bundle = path.join(
    path.dirname(require.resolve("expo-widgets/package.json")),
    "bundle/build/ExpoWidgets.bundle"
  );
  if (!fs.existsSync(bundle)) {
    throw new Error(`No widget bundle at ${bundle} — build the iOS app once to produce it.`);
  }

  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(bundle, "utf8"), sandbox, { filename: "ExpoWidgets.bundle" });
  vm.runInContext(`globalThis.__expoWidgetLayout = (${layoutsIn(file)[0]});`, sandbox);

  const describe = (modifier) => {
    const style = modifier.style ?? modifier.tint;
    const color =
      modifier.color ?? (style && typeof style === "object" ? style.color : undefined);
    if (color) {
      return `${modifier.$type}=${color}`;
    }
    if (typeof style === "string") {
      return `${modifier.$type}=${style}`;
    }
    if (modifier.family) {
      return `font=${modifier.family}@${modifier.size ?? ""}`;
    }
    return modifier.$type;
  };

  const walk = (node, depth) => {
    if (Array.isArray(node)) {
      node.forEach((child) => walk(child, depth));
      return;
    }
    if (!node || typeof node !== "object" || !node.type) {
      return;
    }
    const props = node.props ?? {};
    const modifiers = (props.modifiers ?? []).map(describe).join("  ");
    const indent = "  ".repeat(depth);
    console.log(indent + node.type.replace("View", "") + (modifiers ? `   [${modifiers}]` : ""));
    if (props.text) {
      console.log(`${indent}  › ${props.text}`);
    }
    walk(props.children, depth + 1);
  };

  walk(vm.runInContext("__expoWidgetRender", sandbox)(props, environment), 0);
}

if (process.argv[2] === "--render") {
  render(
    process.argv[3],
    JSON.parse(process.argv[4] ?? "{}"),
    JSON.parse(process.argv[5] ?? '{"widgetFamily":"systemMedium","colorScheme":"light"}')
  );
  process.exit(0);
}

const allowed = new Set([...expoUiExports(), ...RUNTIME_STUBS, ...JS_BUILTINS]);

const files = [];
const collect = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(full);
    } else if (entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
};
collect(widgetsDir);

let failed = false;
for (const file of files) {
  const relative = path.relative(root, file);
  for (const layout of layoutsIn(file)) {
    const unknown = [...freeIdentifiers(layout)].filter((name) => !allowed.has(name)).sort();
    if (unknown.length > 0) {
      failed = true;
      console.error(`✖ ${relative}: not available in the widget runtime — ${unknown.join(", ")}`);
    } else {
      console.log(`✓ ${relative}`);
    }
  }
}

process.exit(failed ? 1 : 0);
