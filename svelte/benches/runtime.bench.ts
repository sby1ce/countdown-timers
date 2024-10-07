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

import { dlopen, FFIType, read, suffix, toArrayBuffer, type Pointer } from "bun:ffi";
// import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "$lib/timers.ts";
// import { initialize, seed, bench1000, formatRuntime } from "$lib/bench.ts";

function callNative(): void {
  const DLL_PATH = `${import.meta.dir}/../../countdown-rs/target/release/cd_native.${suffix}`;

  const {
    symbols: { as_pointer, drop_vec, update_timers },
    // Gathering into object because eslint doesn't like
    // `close` being called without `this`
    // It is unclear whether it is required or recommended to call close in the first place
    // but the example in the docs says `JSCallback` instances specifically need to be closed
    ...dll
  } = dlopen(DLL_PATH, {
    as_pointer: {
      args: ["usize"],
      returns: FFIType.ptr,
    },
    drop_vec: {
      args: [FFIType.ptr, "usize"],
      returns: FFIType.void,
    },
    update_timers: {
      args: [FFIType.ptr, "usize"],
      returns: FFIType.ptr,
    },
  });

  const len = 4;
  // Array is automatically filled with zeros
  const arr = new BigInt64Array(len);

  const ptr = update_timers(arr, 4);
  if (ptr === null) {
    dll.close();
    return;
  }

  const vec: Pointer | null = as_pointer(read.ptr(ptr));
  if (vec === null) {
    dll.close();
    return;
  }
  // There is no read.usize and `usize` is the same size as pointer
  const length = read.ptr(ptr, 8);
  console.log(
    `Pointer to Vec ${ptr.toString(16)}, ` +
      `pointer to first element in Vec ${vec.toString(16)} and length ${length}`,
  );
  console.log("Reading first element of vec", read.u16(vec));
  // not using deallocator arguments in `toArrayBuffer` (that isn't typed in `@types/bun` yet)
  // because for some reason it causes issues with properly reading data
  // and it doesn't get called anyway
  //
  // `toArrayBuffer` actually returns a fake ArrayBuffer by bun,
  // so need to cast to a TypedArray for `TextDecoder` to work
  //
  // `length * 2` because u16 is 2 bytes
  const buffer = new Uint16Array(toArrayBuffer(vec, 0, length * 2));

  const decoder = new TextDecoder("utf-16");
  // God knows why this doesn't work
  console.log(decoder.decode(buffer), buffer);

  drop_vec(buffer, length);

  dll.close();
}

async function main(): Promise<void> {
  callNative();

  await Promise.resolve(void null);

  /* const wasmUpdate: TimerFunc = await initialize();

  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const wasmAvg: number = bench1000(wasmUpdate, origins);

  const formatted =
    formatRuntime("TypeScript", tsAvg) + "\n" + formatRuntime("WebAssembly", wasmAvg);

  console.log(formatted); */
}

await main();
