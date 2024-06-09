/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

/** Benchmark functions implemented in TypeScript vs Rust
 * in a JavaScript runtime (not browser),
 * without rendering in HTML
 *
 * @module
 */

import { newTimers as tsUpdate, type Origins, wasmWrapper } from "$lib/timers.ts";
import init, { update_timers } from "$wasm";

type BenchFunction = (o: Origins) => string[][];

async function initialize(): Promise<BenchFunction> {
  await init();
  return wasmWrapper(update_timers);
}

/**
 * Setup data
 */
function seed(): Origins {
  const ts: number[] = [0, 1696174196000, 1607025600000];
  const wasm: BigInt64Array = new BigInt64Array(ts.map(BigInt));
  return {
    ts,
    wasm,
  } satisfies Origins;
}

function formatResult(name: string, result: number): string {
  return (
    name.padEnd(11) +
    " impl: " +
    result.toFixed(4).padStart(7) +
    " microseconds average over 1000 runs"
  );
}

/**
 * @returns {number} Average time over a thousand runs of the function
 */
function bench1000(func: BenchFunction, data: Origins): number {
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

async function main(): Promise<void> {
  const wasmUpdate: BenchFunction = await initialize();

  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const wasmAvg: number = bench1000(wasmUpdate, origins);

  const formatted = formatResult("TypeScript", tsAvg) + "\n" + formatResult("WebAssembly", wasmAvg);

  console.log(formatted);
}

await main();
