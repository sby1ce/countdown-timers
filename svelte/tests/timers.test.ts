/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { describe, test, expect } from "bun:test";
import { tsTimers as tsUpdate, type Origins, type TimerFunc } from "$lib/timers.ts";
import { initialize, seed } from "$lib/bench.ts";

const data: Origins = seed();
const rsUpdate: TimerFunc = await initialize();

describe("render timer updates", () => {
  test("ts impl", () => {
    expect(tsUpdate).toBeInstanceOf(Function);

    const renders: string[][] = tsUpdate(data);

    expect(renders).toBeInstanceOf(Array);
    expect(renders[0]).toBeInstanceOf(Array);
    expect(renders[0][0]).toMatch(/-[\dwdhms]+ /);
  });

  test("rs impl", () => {
    expect(rsUpdate).toBeInstanceOf(Function);

    const renders: string[][] = rsUpdate(data);

    expect(renders).toBeInstanceOf(Array);
    expect(renders[0]).toBeInstanceOf(Array);
    expect(renders[0][0]).toMatch(/-[\dwdhms]+ /);
  });
});
