<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import Licence from "./Licence.svelte";

  const LICENCES: [string, string][] = [
    ["babel-plugin-react-compiler", "MIT"],
    ["bun", "MIT"],
    ["clsx", "MIT"],
    ["eslint", "MIT"],
    ["eslint-config-next", "MIT"],
    ["eslint-config-prettier", "MIT"],
    ["eslint-plugin-svelte", "MIT"],
    ["eslint-plugin-testing-library", "MIT"],
    ["espree", "BSD-2-Clause"],
    ["globals", "MIT"],
    ["jsdom", "MIT"],
    ["next", "MIT"],
    ["prettier", "MIT"],
    ["prettier-plugin-svelte", "MIT"],
    ["react", "MIT"],
    ["react-dom", "MIT"],
    ["react-redux", "MIT"],
    ["reduxjs", "MIT"],
    ["sass", "MIT"],
    ["solid-js", "MIT"],
    ["svelte", "MIT"],
    ["svelte-check", "MIT"],
    ["testing-library", "MIT"],
    ["tslib", "0BSD"],
    ["typescript", "Apache-2.0"],
    ["typescript-eslint", "BSD-2-Clause"],
    ["vinxi", "MIT"],
    ["vite", "MIT"],
    ["vite-plugin-wasm", "MIT"],
    ["vitest", "MIT"],
    ["js-sys", "MIT OR Apache-2.0"],
    ["wasm-bindgen", "MIT OR Apache-2.0"],
  ];
</script>

<main>
  <h1>Licences</h1>

  {#each LICENCES as licence}
    <Licence pkg={licence[0]} licence={licence[1]} />
  {/each}
</main>
