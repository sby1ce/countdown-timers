import js from "@eslint/js";
import tseslint from "typescript-eslint";
import * as tsParser from "@typescript-eslint/parser";
import * as espree from "espree";
import svelteParser from "svelte-eslint-parser";
import prettier from "eslint-config-prettier";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...eslintPluginSvelte.configs["flat/recommended"],
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".svelte"],
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.svelte", "*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        project: true,
        parser: {
          ts: tsParser,
          js: espree,
          typescript: tsParser,
        },
      },
    },
    // These create errors because of svelteParser
    // At the same time, disabling them creates parsing errors
    // ...tseslint.configs.disableTypeChecked,
  },
  prettier,
  {
    ignores: [
      ".DS_Store",
      "node_modules/*",
      ".git/*",
      ".gitignore",
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/bun.lockb",
      ".vscode/*",
      ".reuse/*",
      "vite.config.ts.*",
      "vite.config.js.*",
      "idk/*",
      "**/eslint.config.js",
      "static/*",
      "build/*",
      ".svelte-kit/*",
      ".github/*",
      "countdown-rs/*",
      // This eslint shit doesn't work
      // the config shown in svelte-eslint-parser doesn't work
      "**/*.svelte",
      // TODO add this to tsconfig.json
      "svelte.config.js",
    ],
  },
);
