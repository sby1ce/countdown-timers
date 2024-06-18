/* 
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0 
*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import * as tsParser from "@typescript-eslint/parser";
import solid from "eslint-plugin-solid/configs/recommended.js";
import prettier from "eslint-config-prettier";

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
    files: ["**/*.{ts,tsx}"],
    ...solid,
    languageOptions: {
      parser: tsParser,
    },
  },
  prettier,
  {
    ignores: [
      ".git/*",
      ".gitignore",
      "node_modules/*",
      ".output/",
      ".vinxi/*",
      "preview-server/*",
      "**/bun.lockb",
      "public/*",
      "**/eslint.config.js",
    ],
  },
);
