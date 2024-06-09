<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { type Origins, newTimers as tsUpdate, wasmWrapper } from "$lib/timers";
  import init, { update_timers } from "$wasm";
  import { onMount } from "svelte";

  const wasmUpdate: (o: Origins) => string[][] = wasmWrapper(update_timers);

  async function initialize(): Promise<void> {
    await init();
  }

  onMount(initialize);

  interface Results {
    ts: number;
    rs: number;
  }

  let results: Results | null = null;

  function formatResult(result: number | undefined): string {
    return result !== undefined ? (
      result.toFixed(4).padStart(7) +
      " microseconds average over 1000 runs"
    ) : "-";
  }

  function seed(): Origins {
    const ts: number[] = [0, 1696174196000, 1607025600000];
    const wasm: BigInt64Array = new BigInt64Array(ts.map(BigInt));
    return {
      ts,
      wasm,
    } satisfies Origins;
  }

  /**
   * @returns {number} Average time over a thousand runs of the function
   */
  function bench1000(func: (o: Origins) => string[][], data: Origins): number {
    const start: number = performance.now();

    for (let i = 0; i < 1000; i++) {
      const renders: string[][] = func(data);
      if (
        !Array.isArray(renders) ||
        !Array.isArray(renders[0]) ||
        !renders.every((row) => row.every((val) => val.length > 0))
      ) {
        throw new Error("What");
      }
    }

    const end: number = performance.now();

    const microseconds: number = end - start; // / 1000 * 1000;
    return microseconds;
  }

  function bench(): void {
    const origins: Origins = seed();

    const tsAvg: number = bench1000(tsUpdate, origins);
    const wasmAvg: number = bench1000(wasmUpdate, origins);

    results = {
      ts: tsAvg,
      rs: wasmAvg,
    } satisfies Results;
  }
</script>

<article>
  <h1>Benchmarks</h1>
  <p>Average time over 1000 function runs in microseconds</p>

  <section>
    <h2>TypeScript</h2>
    <p>{formatResult(results?.ts)}</p>
  </section>
  <section>
    <h2>Rust</h2>
    <p>{formatResult(results?.rs)}</p>
  </section>
</article>

{#if results === null}
  <p>Press the button to run the benchmark</p>
{/if}

<button type="button" on:click={bench}> Benchmark </button>
