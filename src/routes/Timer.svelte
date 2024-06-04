<script lang="ts">
  import { storageAvailable } from "./storage.ts";
  import { timers } from "./timers.ts";
  //@ts-expect-error
  import { get_current_component } from "svelte/internal";

  export let position: number;

  const thisComponent = get_current_component();

  // Menu variables
  let top: string;
  let left: string = "90%";
  type Symbol = "-" | "v";
  let symbol: Symbol = "-";
  let hidden: boolean = true;

  function deleteTimer(e: Event) {
    e.preventDefault();

    timers.update((t) => {
      return t.slice(0, position).concat(t.slice(position));
    });

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify($timers));
    }

    thisComponent.$destroy();
  }

  function settings(e: Event) {
    e.preventDefault();

    if (symbol === "-") {
      const button = (e.currentTarget as HTMLButtonElement)!;
      const buttonRect = button.getBoundingClientRect();

      top = `${buttonRect.top + window.scrollY}px`;
      left = `${buttonRect.left + window.scrollX + button.offsetWidth}px`;

      symbol = "v";
      hidden = false;
    } else {
      symbol = "-";
      hidden = true;
    }
  }
</script>

<article>
  <h1>{$timers[position].name}</h1>
  <section>
    {#each $timers[position].timerStrings as countdown}
      <p>{countdown}</p>
    {/each}

    <button class="settings" type="button" on:click={settings}>
      {symbol}
    </button>

    <div class:hidden style:left style:top>
      <button type="button">gaming</button>
      <button type="button">gaming 2</button>
      <button type="button" on:click={deleteTimer}>Delete timer</button>
    </div>
  </section>
</article>

<style>
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
    /*box-sizing: border-box;*/
    margin: 0px 5px 0px 5px;
  }

  .settings {
    font-family: inherit;
    box-sizing: border-box;
    inline-size: 2em;
    min-block-size: 100%;
    margin: 0 0 0 2em;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
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

  .hidden {
    display: none;
  }

  button {
    font-family: inherit;
    background-color: #222222;
    color: #dddddd;
  }
</style>
