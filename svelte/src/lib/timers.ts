/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { writable } from "svelte/store";
import { loadFromLocalStorage } from "./storage.ts";

export const timers = writable<ITimer[]>(loadFromLocalStorage());

export interface ITimer {
  key: string;
  name: string;
  origin: number;
}

export type TimerFunc = (origins: Origins) => string[][];

enum FormatOption {
  Week,
  Day,
  Hour,
  Minute,
  Second,
  Millisecond,
}

interface TimeUnit {
  suffix: string;
  divisor: number;
}

const TIME_UNITS: TimeUnit[] = [
  { suffix: "w", divisor: 1000 * 60 * 60 * 24 * 7 },
  { suffix: "d", divisor: 1000 * 60 * 60 * 24 },
  { suffix: "h", divisor: 1000 * 60 * 60 },
  { suffix: "m", divisor: 1000 * 60 },
  { suffix: "s", divisor: 1000 },
  { suffix: "ms", divisor: 1 },
];

function toTimeUnit(formatOption: FormatOption): TimeUnit {
  switch (formatOption) {
    case FormatOption.Week:
      return TIME_UNITS[0];
    case FormatOption.Day:
      return TIME_UNITS[1];
    case FormatOption.Hour:
      return TIME_UNITS[2];
    case FormatOption.Minute:
      return TIME_UNITS[3];
    case FormatOption.Second:
      return TIME_UNITS[4];
    case FormatOption.Millisecond:
      return TIME_UNITS[5];
  }
}

function reduceInterval(interval: number, accumulator: string, formatOptions: FormatOption[]) {
  const formatLen: number = formatOptions.length;
  if (formatLen === 0) {
    return accumulator;
  }
  const formatOption: FormatOption = formatOptions[0];
  const timeUnit = toTimeUnit(formatOption);
  const newInterval: number = interval % timeUnit.divisor;
  const unitCount: number = Math.floor(interval / timeUnit.divisor);
  const newAccumulator: string = accumulator + unitCount.toString() + timeUnit.suffix + " ";

  return reduceInterval(newInterval, newAccumulator, formatOptions.slice(1));
}

function convert(interval: number, formatOptions: FormatOption[]): string {
  const absInterval: number = Math.abs(interval);
  const accumulator: string = interval >= 0 ? "" : "-";

  return reduceInterval(absInterval, accumulator, formatOptions);
}

function updateTimer(origin: number, now: number): string[] {
  const interval: number = origin - now;
  const formatOptions: FormatOption[] = [
    FormatOption.Day,
    FormatOption.Hour,
    FormatOption.Minute,
    FormatOption.Second,
  ];

  return [convert(interval, formatOptions)];
}

export function tsTimers(origins: Origins): string[][] {
  const now: number = Date.now();

  const result: string[][] = origins.ts.map((origin: number): string[] => updateTimer(origin, now));

  return result;
}

export function wasmWrapper(updater: (n: bigint, o: BigInt64Array) => string[][]): TimerFunc {
  const thingamabob: TimerFunc = (origins: Origins): string[][] => {
    const now: bigint = BigInt(Date.now());
    const result: string[][] = updater(now, origins.wasm);
    return result;
  };
  return thingamabob;
}

export interface Origins {
  ts: number[];
  wasm: BigInt64Array;
}

export function originsPipe(itimers: ITimer[]): Origins {
  const ts: number[] = itimers.map((itimer: ITimer): number => itimer.origin);
  const wasm: BigInt64Array = new BigInt64Array(ts.map(BigInt));

  return {
    ts,
    wasm,
  } satisfies Origins;
}
