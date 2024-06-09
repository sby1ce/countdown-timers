/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// import adapter from '@sveltejs/adapter-auto';

const dev = process.argv.includes("dev");

const _basePath = process.env.BASE_PATH;
/** @type {`/${string}` | undefined} */
const base =
  _basePath === undefined
    ? undefined
    : _basePath.startsWith("/")
      ? `/${_basePath.slice(1)}` // satisfying the type
      : `/${_basePath}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    paths: {
      base: dev ? "" : base,
    },
    alias: {
      $licences: "./LICENCES",
      $wasm: "./countdown-rs/pkg",
    },
  },
};

export default config;