/* 
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0 
*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import js from "@eslint/js";
import tseslint from "typescript-eslint";

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
      ".output/",
      ".vinxi/*",
      "preview-server/*",
      "**/bun.lockb",
      "public/*",
      "**/eslint.config.js",
    ],
  },
);
