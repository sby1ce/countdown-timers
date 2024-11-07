/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import init, { update_timers } from "../../countdown-rs/pkg";
import { wasmWrapper, type Origins, type TimerFunc } from "./timers.ts";

function range(start: number, length: number): number[] {
  return Array(length)
    .fill(start)
    .map((value: number, index: number) => value + index);
}

/**
 * Setup data
 */
export function seed(): Origins {
  const ts: number[] = [0, 1696174196000, 1607025600000].concat(range(1, 200));
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

export async function initialize(): Promise<TimerFunc> {
  await init();
  return wasmWrapper(update_timers);
}
