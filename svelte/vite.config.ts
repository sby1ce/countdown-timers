/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/
/// <reference types="vitest" />

import { sveltekit } from "@sveltejs/kit/vite";
import wasm from "vite-plugin-wasm";
import { defineConfig, defaultExclude } from "vitest/config";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
  plugins: [sveltekit(), wasm(), svelteTesting()],
  build: {
    target: "esnext",
  },
  server: {
    fs: {
      allow: ["../countdown-rs/pkg/"],
    },
  },
  test: {
    exclude: [...defaultExclude, "**/tests/**"],
    environment: "jsdom",
    setupFiles: ["./vitest-setup.js"],
  },
});
