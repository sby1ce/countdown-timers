/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import { defineNuxtConfig } from "nuxt/config";

const baseURL: string = "/countdown-timers/vue";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    $wasm: "../countdown-rs/pkg",
  },
  app: {
    baseURL,
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: baseURL + "/icon.svg" },
      ],
    },
  },
  compatibilityDate: "2024-10-11",
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
    prerender: {
      // During prerender, the baseURL doesn't apply yet
      ignore: ["/countdown-timers"],
    },
  },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      base: baseURL,
    },
  },
});
