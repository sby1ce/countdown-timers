/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { wasmWrapper, type TimerFunc, type Origins } from "./timers.ts";

export async function initialize(): Promise<TimerFunc> {
  const base: string | undefined = process.env.BASE_PATH;
  if (base === undefined) {
    // TODO remove this check
    throw new Error("No base path in env");
  }
  const wasmPath: string = base + "/timers_bg.wasm";

  return wasmWrapper(
    (await WebAssembly.instantiateStreaming(fetch(wasmPath)).then(
      (source) => source.instance.exports.update_timers!,
    )) as any,
  );
}

/**
 * Setup data
 */
export function seed(): Origins {
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
export function bench1000(func: TimerFunc, data: Origins): number {
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

export function formatRuntime(name: string, result: number): string {
  return (
    name.padEnd(11) +
    " impl: " +
    result.toFixed(4).padStart(7) +
    " microseconds average over 1000 runs"
  );
}

export function formatBrowser(result: number | undefined): string {
  return result !== undefined
    ? result.toFixed(4).padStart(7) + " microseconds average over 1000 runs"
    : "-";
}
