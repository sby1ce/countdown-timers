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
  </div>

  <button class="settings" type="button" on:click={toggle}>
    <Kebab />
  </button>
</article>

<style lang="scss">
  article {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid red;
  }

  div {
    display: flex;
    border-width: 2em;
    border-color: whitesmoke;
    border-style: solid;
    position: absolute;
    z-index: 255;
    flex-direction: column;
  }

  button {
    font-family: inherit;
    background-color: #222222;
    color: #dddddd;
  }

  .hidden {
    display: none;
  }
</style>
