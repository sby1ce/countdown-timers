<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { onMount } from "svelte";
  import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "$lib/timers.ts";
  import { initialize, seed, bench1000, formatBrowser } from "$lib/bench.ts";
  import Button, { ButtonStyle } from "$lib/Button.svelte";

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

<main>
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

  <p>Press the button to run the benchmark</p>

  <form><Button style={ButtonStyle.SecondaryBg} on:click={bench}>Benchmark</Button></form>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1,
  h2 {
    font-weight: normal;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h2,
  p,
  form {
    margin: 1em 0 1em 0;
  }
</style>
