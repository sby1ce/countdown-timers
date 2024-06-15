/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
// import adapter from '@sveltejs/adapter-auto';

/** @type {`/${string}` | undefined} */
// @ts-expect-error trust me bro
const base = process.env.PUBLIC_PATH;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      fallback: "404.html",
    }),
    paths: {
      base,
    },
  },
};

export default config;
