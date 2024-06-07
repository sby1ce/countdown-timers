/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import { sveltekit } from "@sveltejs/kit/vite";
import wasm from "vite-plugin-wasm";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), wasm()],
  build: {
    target: "esnext",
  },
  server: {
    fs: {
      allow: ["countdown-rs/pkg/"],
    },
  },
});
