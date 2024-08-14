/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      // disabling this in eslint to enable `noUnusedLocals` in tsconfig.json
      // as per this issue https://github.com/vuejs/language-tools/issues/47
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  prettier,
  {
    ignores: [
      ".git/*",
      ".gitignore",
      "node_modules/*",
      ".nuxt/*",
      ".output/*",
      "dist/*",
      "**/bun.lockb",
      "**/public/*",
      "**/eslint.config.js",
    ],
  },
);
