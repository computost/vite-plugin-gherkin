import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended],
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  {
    // Vitest dependency resolutions
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    rules: {
      "no-empty-pattern": ["error", { allowObjectPatternsAsParameters: true }],
    },
  },
  {
    extends: [json.configs.recommended],
    files: ["**/*.json"],
    language: "json/json",
    plugins: { json },
  },
  {
    extends: [markdown.configs.recommended],
    files: ["**/*.md"],
    language: "markdown/gfm",
    plugins: { markdown },
  },
  {
    extends: [perfectionist.configs["recommended-natural"]],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: { "perfectionist/sort-modules": ["off"] },
  },
  prettier,
]);
