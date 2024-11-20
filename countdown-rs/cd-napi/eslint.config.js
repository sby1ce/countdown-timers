/* 
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0 
*/

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      ".git/*",
      ".gitignore",
      "node_modules/*",
      "target/*",
      "**/bun.lockb",
      "**/eslint.config.js",
      "index.js",
      "index.d.ts",
    ],
  },
  oxlint.configs["flat/recommended"],
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
);
