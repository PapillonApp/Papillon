const stylistic = require("@stylistic/eslint-plugin");
const unusedImports = require("eslint-plugin-unused-imports");
const typescript = require("@typescript-eslint/parser");

const custom_rules = require("./eslint_rules/plugin.js");

module.exports = [
  { // Ignored directory
    ignores: [
      "**/node_modules/",
      "**/android/",
      "**/ios/",
      "**/.*"
    ]
  },
  { // Apply to `cjs`, `.mjs` and `.js` files.
    files: ["**/*.?([cm])js?(x)"]
  },
  { // Apply to `cts`, `.mts` and `.ts` files.
    files: ["**/*.?([cm])ts?(x)"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        sourceType: "module"
      }
    }
  },
  {
    languageOptions: {
      parser: typescript
    },
    plugins: {
      "@stylistic": stylistic,
      "unused-imports": unusedImports,
      "custom": custom_rules
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", "always"],
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-mixed-spaces-and-tabs": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/keyword-spacing": ["error", {
        "before": true
      }],
      "@stylistic/arrow-parens": "error",
      "@stylistic/arrow-spacing": "error",
      "unused-imports/no-unused-imports": "error",
      "no-unused-vars": ["error", {
        "args": "none"
      }],
      "no-var": "error",
      "no-irregular-whitespace": "error",
      "no-unneeded-ternary": "error",
      "no-duplicate-imports": "error",
      "no-empty": "error",
      "no-useless-escape": "error",
      "custom/redundant-logical": "error",
      "custom/no-redundant-ternary": "error"
    }
  }
];
