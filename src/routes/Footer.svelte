<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import Button from "$lib/Button.svelte";

  function clear() {
    if (localStorage?.length) {
      localStorage.clear();
    }
  }
</script>

<footer>
  <Button on:click={clear}>Clear localStorage</Button>
</footer>

<style lang="scss">
  @use "$lib/variables" as v;

  footer {
    margin: 0;
    border: 0;
    padding: 1.5rem;
    border-top: 0.5rem solid v.$primary-colour;
    inline-size: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: v.$secondary-bg-colour;
    box-shadow: 0 50vh 0 50vh v.$secondary-bg-colour;
  }
</style>
