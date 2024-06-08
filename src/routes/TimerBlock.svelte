<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    timers,
    newTimers,
    wasmWrapper,
    type ITimer,
    type Origins,
    originsPipe,
  } from "$lib/timers.ts";
  import { storageAvailable } from "$lib/storage.ts";
  import Timer from "./Timer.svelte";
  import AddTimer from "./AddTimer.svelte";
  import init, { update_timers } from "$wasm";

  let updateTimers: (o: Origins | undefined) => string[][] = newTimers;

  function hashTimerName(timerName: string) {
    return `timer${Array.from(timerName).reduce(
      (hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
      0,
    )}`;
  }

  function dateStringToUnix(dateString: string) {
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

  function addTimerEvent(event: DispatchedEvent) {
    const newOrigin = dateStringToUnix(event.detail.timerDate);

    if (typeof newOrigin !== "number" || Number.isNaN(newOrigin)) {
      event.preventDefault();
      return null;
    }

    const innerName = hashTimerName(event.detail.timerName);

    for (const timer of $timers) {
      if (timer.key === innerName) {
        event.preventDefault();
        return null;
      }
    }

    const newTimer = {
      key: innerName,
      name: event.detail.timerName,
      origin: newOrigin,
      timerStrings: ["0d 0h 0m 0s", "0s", "0h"],
    };

    timers.update((t) => [...t, newTimer]);

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify($timers));
    }
  }

  function popTimer(timers: ITimer[], id: number): ITimer[] {
    return timers.slice(0, id).concat(timers.slice(id + 1));
  }

  function pop(id: number): void {
    timers.update((ts) => popTimer(ts, id));
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

  // during prerender this is undefined
  let origins: Origins = originsPipe($timers);
  $: {
    origins = originsPipe($timers);
  }

  let renders: string[][] = updateTimers(origins);
  const interval = setInterval(() => {
    renders = updateTimers(origins);
  }, 1000);

  async function initialize() {
    try {
      await init();
      updateTimers = wasmWrapper(update_timers);
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

<AddTimer on:click={addTimerEvent} />
