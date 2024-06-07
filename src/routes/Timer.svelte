<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import Kebab from "$lib/Kebab.svelte";

  export let pop: () => void;
  export let name: string;
  export let countdowns: string[];
  let hidden: boolean = true;

  function toggle(): void {
    hidden = !hidden;
  }
</script>

<article>
  <h1>{name}</h1>

  <section>
    {#each countdowns as countdown}
      <p>{countdown}</p>
    {/each}
  </section>

  <!-- hidden is not a reliable attribute -->
  <div class:hidden>
    <button type="button" on:click={pop}>Delete timer</button>

    <button class="settings" type="button" on:click={toggle}>
      <Kebab />
    </button>
  </div>
</article>

<style lang="scss">
  @use "$lib/variables" as v;

  $padding: 0.5em;

  article {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    min-inline-size: min-content;
    inline-size: max(75%, 300px);
    border: 0.1em solid rgba(v.$primary-colour, 0.8);
    margin: 0.5em 0 0.5em 0;
    padding: $padding;
  }

  h1 {
    color: v.$primary-colour;
    margin: 0;
  }

  section {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  p {
    margin: 0 1em 0 1em;
  }

  .settings {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    block-size: 50%;
    visibility: visible;
    color: transparent;
    background-color: v.$secondary-background-colour;
    box-shadow: 0 0 5px rgba(v.$text-colour, 0.1);

    &:hover {
      background-color: rgba(v.$primary-colour, 0.8);
    }
  }

  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    right: $padding;
    block-size: 100%;
    margin: 0;
    padding: 0;
  }

  button {
    font-family: inherit;
    background-color: #222222;
    color: #dddddd;
  }

  .hidden {
    visibility: hidden;
  }
</style>
