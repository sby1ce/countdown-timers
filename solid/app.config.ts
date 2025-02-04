/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import { defineConfig } from "@solidjs/start/config";
import wasm from "vite-plugin-wasm";

process.env.VITE_PATH = "/countdown-timers/solid";

export default defineConfig({
  ssr: true,
  server: {
    preset: "static",
    baseURL: process.env.VITE_PATH,
    compatibilityDate: "2024-11-07",
  },
  vite: {
    plugins: [wasm()],
    server: {
      fs: {
        allow: ["../countdown-rs/pkg/"],
      },
    },
  },
});
