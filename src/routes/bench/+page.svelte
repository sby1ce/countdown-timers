<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { onMount } from "svelte";
  import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "$lib/timers.ts";
  import { initialize, seed, bench1000, formatBrowser } from "$lib/bench.ts";

  let rsUpdate: TimerFunc;

  onMount(async () => {
    rsUpdate = await initialize();
  });

  interface Results {
    ts: number;
    rs: number;
  }

  let results: Results | null = null;

  function bench(): void {
    const origins: Origins = seed();

    const tsAvg: number = bench1000(tsUpdate, origins);
    const rsAvg: number = bench1000(rsUpdate, origins);

    results = {
      ts: tsAvg,
      rs: rsAvg,
    } satisfies Results;
  }
</script>

<article>
  <h1>Benchmarks</h1>
  <p>Average time over 1000 function runs in microseconds</p>

  <section>
    <h2>TypeScript</h2>
    <p>{formatBrowser(results?.ts)}</p>
  </section>
  <section>
    <h2>Rust</h2>
    <p>{formatBrowser(results?.rs)}</p>
  </section>
</article>

{#if results === null}
  <p>Press the button to run the benchmark</p>
{/if}

<button type="button" on:click={bench}> Benchmark </button>
