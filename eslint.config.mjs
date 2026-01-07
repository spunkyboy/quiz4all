import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // JS files (all)
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        DOMPurify: "readonly",
        Swal: "readonly",
      },
    },
  },

  // CommonJS-specific files
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  // CSS files
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },

  // Jest test files
  {
    files: ["**/*.test.js", "**/jest.setup.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        DOMPurify: "readonly",
        Swal: "readonly",
      },
    },
  },
]);
