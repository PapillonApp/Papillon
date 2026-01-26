import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: Object.fromEntries(
        Object.entries(globals.browser).map(([key, value]) => [
          key.trim(),
          value,
        ])
      ),
    },
  },
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettierConfig, // Désactive les règles ESLint qui entrent en conflit avec Prettier
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      indent: ["error", 2],
      "no-duplicate-imports": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
      "no-unassigned-vars": "error",
      "no-unreachable-loop": "error",
      "no-useless-assignment": "error",
      "react/display-name": "off",
      camelcase: ["error", { properties: "always" }],
      curly: "error",
      "default-case": "error",
      "default-case-last": "error",
      "default-param-last": "error",
      eqeqeq: "error",
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
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "@typescript-eslint/no-unused-vars": "off", // Désactiver la règle de base
      "unused-imports/no-unused-imports": "error", // Supprimer automatiquement les imports inutilisés
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
