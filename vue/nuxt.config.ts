/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  $production: {
    devtools: { enabled: false },
  },
  future: {
    compatibilityVersion: 4,
  },
  srcDir: "src/",
  ssr: true,
  nitro: {
    preset: "github-pages",
  },
});
