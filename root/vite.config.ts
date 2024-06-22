/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        index: "index.html",
        bench: "bench/index.html",
        legal: "legal/index.html",
      },
    },
  },
  base: "/countdown-timers",
});
