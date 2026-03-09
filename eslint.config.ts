import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],

    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname, 
      },
    },

    rules: {
      "@typescript-eslint/no-floating-promises": "error",
    },
  }
);