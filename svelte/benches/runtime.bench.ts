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

import {
  dlopen,
  FFIType,
  ptr,
  read,
  suffix,
  toArrayBuffer,
  type FFIFunction,
  type Library,
  type Pointer,
} from "bun:ffi";
import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "$lib/timers.ts";
import { initialize, seed, bench1000, formatRuntime } from "$lib/bench.ts";

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

class NatVec implements Disposable {
  private constructor(
    private readonly drop: (ptr: BigUint64Array, length: number) => void,
    private readonly inner: BigUint64Array,
  ) {}
  public static create(
    box: Pointer | null,
    as_pointer: (ptr: number) => Pointer | null,
    drop: (ptr: BigUint64Array, length: number) => void,
  ): NatVec | null {
    if (box === null) {
      return null;
    }
    const vec: Pointer | null = as_pointer(read.ptr(box));
    if (vec === null) {
      return null;
    }
    // Asssuming this is run on 64 bit system
    // There is no read.usize and `usize` is the same size as pointer
    const length = read.ptr(box, 8);

    // not using deallocator arguments in `toArrayBuffer` (that isn't typed in `@types/bun` yet)
    // because for some reason it causes issues with properly reading data
    // and it doesn't get called anyway
    //
    // `toArrayBuffer` actually returns a fake ArrayBuffer by bun,
    // so need to cast to a TypedArray for `TextDecoder` to work
    //
    // Asssuming this is run on 64 bit system
    // `length * 8` because usize is 8 bytes
    const inner = new BigUint64Array(toArrayBuffer(vec, 0, length * 8));

    return new NatVec(drop, inner);
  }
  iter(): [bigint, bigint][] {
    const iterator: [bigint, bigint][] = [];
    for (let i = 0; i < this.inner.length; i += 2)
      iterator.push([this.inner[i], this.inner[i + 1]]);
    return iterator;
  }
  [Symbol.dispose](): void {
    this.drop(this.inner, this.inner.length);
  }
}

/**
 * Wrapper for `Uint16Array` that implements Disposable
 */
class NatString implements Disposable {
  private readonly decoder = new TextDecoder("utf-16");
  private constructor(
    private readonly drop: (ptr: Uint16Array, length: number) => void,
    private readonly inner: Uint16Array,
  ) {}
  public static create(
    str: Pointer | null,
    length: bigint,
    drop: (ptr: Uint16Array, length: number) => void,
  ): NatString | null {
    if (str === null) {
      return null;
    }

    // not using deallocator arguments in `toArrayBuffer` (that isn't typed in `@types/bun` yet)
    // because for some reason it causes issues with properly reading data
    // and it doesn't get called anyway
    //
    // `toArrayBuffer` actually returns a fake ArrayBuffer by bun,
    // so need to cast to a TypedArray for `TextDecoder` to work
    //
    // `length * 2` because u16 is 2 bytes
    //
    // Surely there won't be strings long enough for this `bigint` to `number` casting to matter
    const inner = new Uint16Array(toArrayBuffer(str, 0, Number(length) * 2));

    return new NatString(drop, inner);
  }
  asString(): string {
    return this.decoder.decode(this.inner);
  }
  [Symbol.dispose](): void {
    this.drop(this.inner, this.inner.length);
  }
}

function nativeWrapper(
  update_timers: (ptr: BigInt64Array, len: number) => Pointer | null,
  as_pointer: (ptr: number | bigint) => Pointer | null,
  drop_pointers: (ptr: BigUint64Array, len: number) => void,
  drop_vec: (ptr: Uint16Array, length: number) => void,
): TimerFunc {
  return (origins: Origins): string[][] => {
    const timestamps: BigInt64Array = origins.wasm;
    const box: Pointer = update_timers(timestamps, timestamps.length)!;
    using vec: NatVec = NatVec.create(box, as_pointer, drop_pointers)!;
    return vec.iter().map(([str, length]) => {
      using natStr = NatString.create(as_pointer(str), length, drop_vec);
      // Ending up cloning anyway to give JavaScript the ownership
      // because it has to drop the data later than `NatString` lifetime.
      // In a real application the string will be consumed but more likely copied by some side effect
      // return [structuredClone(natStr!.asString())];
      return [natStr!.asString()];
    });
  };
}

interface Native extends Disposable {
  ffi: FfiWrapper<Record<string, FFIFunction>>;
  rsUpdate: TimerFunc;
  experimental: (
    origin_ptr: BigInt64Array,
    pointers: BigUint64Array,
    outer_len: number,
    inner_cap: number,
  ) => void;
}

function setupNative(): Native {
  const ffi = new FfiWrapper({
    as_pointer: {
      args: ["usize"],
      returns: FFIType.ptr,
    },
    drop_pointers: {
      args: [FFIType.ptr, "usize"],
      returns: FFIType.void,
    },
    drop_vec: {
      args: [FFIType.ptr, "usize"],
      returns: FFIType.void,
    },
    update_timers: {
      args: [FFIType.ptr, "usize"],
      returns: FFIType.ptr,
    },
    experimental: {
      args: [FFIType.ptr, FFIType.ptr, "usize", "usize"],
      returns: FFIType.void,
    },
  });
  const { as_pointer, drop_vec, drop_pointers, update_timers, experimental } = ffi.symbols();
  return {
    ffi,
    rsUpdate: nativeWrapper(update_timers, as_pointer, drop_pointers, drop_vec),
    experimental,
    [Symbol.dispose]: () => ffi[Symbol.dispose](),
  };
}

const INNER_CAP = 30;

function declareStrings(length: number): [Uint16Array[], BigUint64Array] {
  const strings: Uint16Array[] = [];
  for (let i = 0; i < length; ++i) {
    strings.push(new Uint16Array(INNER_CAP));
  }
  return [
    strings,
    new BigUint64Array(strings.map((pointer: Uint16Array): bigint => BigInt(ptr(pointer)))),
  ];
}

async function main(): Promise<void> {
  using ffi = setupNative();
  const { rsUpdate, experimental } = ffi;

  const wasmUpdate: TimerFunc = await initialize();

  const origins: Origins = seed();
  const [strings, pointers] = declareStrings(origins.ts.length);
  experimental(origins.wasm, pointers, origins.ts.length, INNER_CAP);
  const decoder = new TextDecoder("utf-16");
  console.log(strings.map((a) => decoder.decode(a)));

  const tsAvg: number = bench1000(tsUpdate, origins);
  const wasmAvg: number = bench1000(wasmUpdate, origins);
  const rsAvg: number = bench1000(rsUpdate, origins);

  const formatted =
    formatRuntime("TypeScript", tsAvg) +
    "\n" +
    formatRuntime("WebAssembly", wasmAvg) +
    "\n" +
    formatRuntime("Rust", rsAvg);

  console.log(formatted);
}

await main();
