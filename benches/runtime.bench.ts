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

import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "$lib/timers.ts";
import { initialize, seed, bench1000, formatRuntime } from "$lib/bench.ts";

async function main(): Promise<void> {
  const wasmUpdate: TimerFunc = await initialize();

  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const wasmAvg: number = bench1000(wasmUpdate, origins);

  const formatted =
    formatRuntime("TypeScript", tsAvg) + "\n" + formatRuntime("WebAssembly", wasmAvg);

  console.log(formatted);
}

await main();
