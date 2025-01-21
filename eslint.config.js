const stylistic = require("@stylistic/eslint-plugin");
const unusedImports = require("eslint-plugin-unused-imports");
const typescript = require("@typescript-eslint/parser");

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
      "unused-imports": unusedImports
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", "always"],
      "unused-imports/no-unused-imports": "error"
    }
  }
];
