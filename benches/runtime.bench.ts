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

type BenchFunction = (o: Origins) => string[][]

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

/**
 * @returns {number} Average time over a thousand runs of the function
 */
function bench1000(func: BenchFunction, data: Origins): number {
  const start: number = performance.now();

  for (let i = 0; i < 1000; i++) {
    func(data);
  }

  const end: number = performance.now();

  const timing: number = (end - start) / 1000;
  return timing;
}

async function main(): Promise<void> {
  const wasmUpdate: BenchFunction = await initialize();

  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const wasmAvg: number = bench1000(wasmUpdate, origins);

  console.log(
    `TypeScript impl: ${tsAvg}ms average over 1000 runs` + "\r\n" +
    `WebAssembly impl: ${wasmAvg}ms average over 1000 runs`
  );
}

await main();
