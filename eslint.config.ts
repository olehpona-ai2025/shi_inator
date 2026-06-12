import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
  ignores: ["dist/**", "node_modules/**", "./worker-configuration.d.ts"],
  extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    globals: globals.node,
    parserOptions: {
      project: true,
      tsconfigRootDir: __dirname,
    },
  },

  rules: {
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-explicit-any": "warn",
  },
});
