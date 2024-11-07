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

import { dlopen, FFIType, ptr, suffix, type FFIFunction, type Library } from "bun:ffi";
import { barplot, bench, run } from "mitata";
import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "../src/timers.ts";
import { initialize, seed, bench1000 } from "../src/bench.ts";

const INNER_CAP = 20;
const DLL_PATH = `${import.meta.dir}/../../countdown-rs/target/release/cd_native.${suffix}`;

class FfiWrapper<F extends Record<string, FFIFunction>> implements Disposable {
  private readonly dll: Library<F>;
  constructor(symbols: F) {
    this.dll = dlopen(DLL_PATH, symbols);
  }
  symbols() {
    return this.dll.symbols;
  }
  [Symbol.dispose](): void {
    // Calling on a `dll` object because eslint doesn't like
    // `close` changing `this`
    // It is unclear whether it is required or recommended to call close in the first place
    // but the example in the docs says `JSCallback` instances specifically need to be closed
    this.dll.close();
  }
}

/**
 * In Bun docs they go
 * ```js
 * let myTypedArray = new Uint8Array(32);
 * const myPtr = ptr(myTypedArray);
 * myTypedArray = new Uint8Array(toArrayBuffer(myPtr, 0, 32), 0, 32);
 * ```
 * but nothing in either zig or ts code suggests `myTypedArray` gets dropped in the `ptr` call
 * so I don't see the issue in just reusing the `Uint16Array`, skipping `toArrayBuffer` altogether
 */
function allocate(length: number): [Uint16Array[], BigUint64Array] {
  const strings: Uint16Array[] = new Array(length).fill(null).map(() => new Uint16Array(INNER_CAP));
  return [
    strings,
    new BigUint64Array(strings.map((pointer: Uint16Array): bigint => BigInt(ptr(pointer)))),
  ];
}

function nativeWrapper(
  update_timers: (
    origin_ptr: BigInt64Array,
    pointers: BigUint64Array,
    outer_len: number,
    inner_cap: number,
  ) => void,
): TimerFunc {
  return (origins: Origins): string[][] => {
    const timestamps: BigInt64Array = origins.wasm;
    const length: number = timestamps.length;
    const [strings, pointers] = allocate(length);
    update_timers(timestamps, pointers, length, INNER_CAP);
    const decoder = new TextDecoder("utf-16");
    return strings.map((render) => [decoder.decode(render)]);
  };
}

interface Native extends Disposable {
  ffi: FfiWrapper<Record<string, FFIFunction>>;
  rsUpdate: TimerFunc;
}

function setupNative(): Native {
  const ffi = new FfiWrapper({
    update_timers: {
      args: [FFIType.ptr, FFIType.ptr, "usize", "usize"],
      returns: FFIType.void,
    },
  });
  const { update_timers } = ffi.symbols();
  return {
    ffi,
    rsUpdate: nativeWrapper(update_timers),
    [Symbol.dispose]: () => ffi[Symbol.dispose](),
  };
}

async function main(): Promise<void> {
  using ffi = setupNative();
  const { rsUpdate } = ffi;

  const wasmUpdate: TimerFunc = await initialize();

  const origins: Origins = seed();

  barplot(() => {
    bench("ts", () => bench1000(tsUpdate, origins));
    bench("wasm", () => bench1000(wasmUpdate, origins));
    bench("rs", () => bench1000(rsUpdate, origins));
  });

  await run();
}

await main();
