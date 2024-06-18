<script lang="ts">
  import Licence from "./Licence.svelte";

  const LICENCES: [string, string][] = [
    ["bun", "MIT"],
    ["eslint", "MIT"],
    ["eslint-config-prettier", "MIT"],
    ["eslint-plugin-svelte", "MIT"],
    ["eslint-plugin-testing-library", "MIT"],
    ["espree", "BSD-2-Clause"],
    ["globals", "MIT"],
    ["prettier", "MIT"],
    ["prettier-plugin-svelte", "MIT"],
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
