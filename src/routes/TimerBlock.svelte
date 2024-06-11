<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    timers,
    tsTimers,
    wasmWrapper,
    type ITimer,
    type Origins,
    type TimerFunc,
    originsPipe,
  } from "$lib/timers.ts";
  import { storageAvailable } from "$lib/storage.ts";
  import Timer from "./Timer.svelte";
  import AddTimer from "./AddTimer.svelte";
  import Button, { ButtonStyle } from "$lib/Button.svelte";
  import init, { update_timers } from "$wasm";

  let rsTimers: TimerFunc = () => {
    throw new Error("wasm failed to load");
  };
  let isRs: boolean = false;
  let updateTimers: TimerFunc = tsTimers;

  const switchFunc = (): void => {
    updateTimers = isRs ? tsTimers : rsTimers;
    isRs = !isRs;
  };

  function hashTimerName(timerName: string): string {
    return `timer${Array.from(timerName).reduce(
      (hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
      0,
    )}`;
  }

  function dateStringToUnix(dateString: string): number | null {
    try {
      const temp = new Date(dateString);

      return Date.UTC(
        temp.getUTCFullYear(),
        temp.getUTCMonth(),
        temp.getUTCDate(),
        temp.getUTCHours(),
        temp.getUTCMinutes(),
        temp.getUTCSeconds(),
        temp.getUTCMilliseconds(),
      );
    } catch {
      return null;
    }
  }

  interface DispatchedEvent extends Event {
    detail: { timerName: string; timerDate: string };
  }

  function addTimerEvent(event: DispatchedEvent): void {
    const newOrigin = dateStringToUnix(event.detail.timerDate);

    if (typeof newOrigin !== "number" || Number.isNaN(newOrigin)) {
      event.preventDefault();
      return;
    }

    const innerName = hashTimerName(event.detail.timerName);

    for (const timer of $timers) {
      if (timer.key === innerName) {
        event.preventDefault();
        return;
      }
    }

    const newTimer: ITimer = {
      key: innerName,
      name: event.detail.timerName,
      origin: newOrigin,
    };

    timers.update((t) => [...t, newTimer]);

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify($timers));
    }
  }

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

  let origins: Origins = originsPipe($timers);
  $: {
    // during prerender this is undefined
    origins = originsPipe($timers);
  }

  let renders: string[][] = updateTimers(origins);
  const interval = setInterval(() => {
    renders = updateTimers(origins);
  }, 1000);

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

{#each $timers as timer, position (timer.key)}
  <Timer pop={pop.bind(null, position)} name={timer.name} countdowns={renders[position] ?? []} />
{/each}

<div>
  <AddTimer on:click={addTimerEvent} />
  <Button style={ButtonStyle.SecondaryBg} on:click={switchFunc}>
    Switch {isRs ? "WA to JS" : "JS to WA"}
  </Button>
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: row;
    margin: 1rem;
  }
</style>
