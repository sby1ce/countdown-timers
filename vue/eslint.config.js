/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
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
