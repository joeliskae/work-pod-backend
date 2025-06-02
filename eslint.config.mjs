import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import * as todoRule from "./eslint-rules/todo-comment-rule.mjs";



export default defineConfig([
  // Ignoret
  {
    ignores: ["dist/**", "node_modules/**", "build/**", "src/dump.ts"]
  },
  {
    plugins: {
      custom: todoRule
    },
    rules: {
      'custom/todo-comment': 'warn'
    },
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
]);
