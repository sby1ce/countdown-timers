import js from "@eslint/js";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import espree from "espree";
import svelteParser from "svelte-eslint-parser";
import prettier from "eslint-config-prettier";
import eslintPluginSvelte from "eslint-plugin-svelte";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...eslintPluginSvelte.configs["flat/recommended"],
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".svelte"],
      },
    },
  },
  {
    files: ["**/*.svelte", "*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: {
          ts: tsParser,
          js: espree,
          typescript: tsParser,
        },
      }
    }
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
    ],
  },
);
