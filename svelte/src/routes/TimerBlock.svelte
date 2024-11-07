<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    tsTimers,
    wasmWrapper,
    type Origins,
    type TimerFunc,
    originsPipe,
  } from "countdown-lib/timers";
  import { timers } from "$lib/timers.ts";
  import { storageAvailable } from "countdown-lib/storage";
  import Timer from "./Timer.svelte";
  import AddTimer from "./AddTimer.svelte";
  import Button, { ButtonStyle } from "$lib/Button.svelte";
  import init, { update_timers } from "$wasm";

  let rsTimers: TimerFunc = $state(() => {
    throw new Error("wasm failed to load");
  });
  let isRs: boolean = $state(false);
  let updateTimers: TimerFunc = $state(tsTimers);

  const switchFunc = (): void => {
    updateTimers = isRs ? tsTimers : rsTimers;
    isRs = !isRs;
  };

  function pop(id: number): void {
    timers.update((ts) => ts.slice(0, id).concat(ts.slice(id + 1)));

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify($timers));
    }
  }

  /* let formats = [
    {
      day: true,
      hour: true,
      minute: true,
      second: true,
    },
    {
      second: true,
    },
    {
      hour: true,
    },
  ]; */

  const origins: Origins = $derived(originsPipe($timers));

  // State referenced in its own scope will never update. Did you mean to reference it inside a closure?
  let renders: string[][] = $state(tsTimers(originsPipe($timers)));
  let interval: ReturnType<typeof setInterval> | undefined = $state();
  $effect(() => {
    interval = setInterval(() => {
      renders = updateTimers(origins);
    }, 1000);
  });

  async function initialize(): Promise<void> {
    try {
      await init();
      rsTimers = wasmWrapper(update_timers);
    } catch (e) {
      console.error(e);
    }
  }

  onMount(initialize);
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div>
  <main>
    {#each $timers as timer, position (timer.key)}
      <Timer
        pop={pop.bind(null, position)}
        name={timer.name}
        countdowns={renders[position] ?? []}
      />
    {/each}
  </main>

  <aside>
    <p>
      Create a <strong>timer</strong> by setting its name and datetime
    </p>

    <article>
      <AddTimer />
    </article>

    <form>
      <Button style={ButtonStyle.SecondaryBg} onclick={switchFunc}>
        Switch {isRs ? "WA to JS" : "JS to WA"}
      </Button>
    </form>
  </aside>
</div>

<style lang="scss">
  @use "../lib/variables" as v;

  div {
    margin: 0;
    padding: 0;
    inline-size: 100%;
    display: grid;
    grid-template-columns: 4fr minmax(0, 1fr);
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  aside {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border-left: 0.5em solid v.$primary-colour;
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  @media (max-width: 400px) {
    div {
      grid-template-columns: 1fr;
    }
  }

  @mixin aside-item {
    height: min-content;
    padding: 1em;
    margin: 0;
  }

  p {
    @include aside-item;
  }

  article {
    @include aside-item;
    width: calc(100% - 2em);
    background-color: v.$secondary-bg-colour;
  }

  form {
    @include aside-item;
    width: calc(100% - 2em);
  }
</style>
