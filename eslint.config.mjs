import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
     plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      "no-duplicate-imports": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-unassigned-vars": "error",
      "no-unreachable-loop": "error",
      "no-useless-assignment": "error",
      "camelcase": ["error", { "properties": "always" }],
      "curly": "error",
      "default-case": "error",
      "default-case-last": "error",
      "default-param-last": "error",
      "eqeqeq": "error",
      "max-depth": ["error", 4],
      "no-console": "error",
      "no-else-return": "error",
      "no-empty-function": "error",
      "no-extra-label": "error",
      "no-lonely-if": "error",
      "no-unneeded-ternary": "error",
      "no-unused-expressions": "error",
      "no-useless-rename": "error",
      "no-var": "error",
      "no-warning-comments": "warn",
      "prefer-promise-reject-errors": "error",
      "simple-import-sort/imports": 'warn',
      "simple-import-sort/exports": 'warn'
    }
  }
]);
