/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import {
  configureStore,
  type UnknownAction,
  type Unsubscribe,
} from "@reduxjs/toolkit";
import { load, save } from "./storage.ts";

export interface ITimer {
  key: string;
  name: string;
  origin: number;
}

export interface AppendTimer extends UnknownAction {
  type: "timers/append";
  payload: ITimer;
}
export function appendTimer(timer: ITimer): AppendTimer {
  return {
    type: "timers/append",
    payload: timer,
  };
}

export interface RemoveTimer extends UnknownAction {
  type: "timers/remove";
  payload: number;
}
export function removeTimer(id: number): RemoveTimer {
  return {
    type: "timers/remove",
    payload: id,
  };
}

export interface InitTimer extends UnknownAction {
  type: "timers/init";
}
export const INIT_TIMERS: InitTimer = { type: "timers/init" };

type TimerActions = AppendTimer | RemoveTimer | InitTimer;

function reducer(state: ITimer[] | undefined, action: TimerActions): ITimer[] {
  switch (action.type) {
    case "timers/append":
      return state ? [...state, action.payload] : [action.payload];
    case "timers/remove":
      if (state === undefined) {
        return [];
      } else if (action.payload >= state.length) {
        return state;
      }
      return state
        .slice(0, action.payload)
        .concat(state.slice(action.payload + 1));
    case "timers/init":
      return load();
  }
}

export const timers = configureStore({
  reducer,
  preloadedState: [],
});
// Syncing with localStorage
const _unsubscribe: Unsubscribe = timers.subscribe(() => {
  const state: ITimer[] = timers.getState();
  save(state);
});

export interface Origins {
  ts: number[];
  wasm: BigInt64Array;
}

export type TimerFunc = (origins: Origins) => string[][];

const enum FormatOption {
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

function reduceInterval(
  interval: number,
  accumulator: string,
  formatOptions: FormatOption[],
) {
  const formatLen: number = formatOptions.length;
  if (formatLen === 0) {
    return accumulator;
  }
  const formatOption: FormatOption = formatOptions[0];
  const timeUnit = toTimeUnit(formatOption);
  const newInterval: number = interval % timeUnit.divisor;
  const unitCount: number = Math.floor(interval / timeUnit.divisor);
  const newAccumulator: string =
    accumulator + unitCount.toString() + timeUnit.suffix + " ";

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

  const result: string[][] = origins.ts.map((origin: number): string[] =>
    updateTimer(origin, now),
  );

  return result;
}

export function wasmWrapper(
  updater: (n: bigint, o: BigInt64Array) => string[][],
): TimerFunc {
  const thingamabob: TimerFunc = (origins: Origins): string[][] => {
    const now = BigInt(Date.now());
    const result: string[][] = updater(now, origins.wasm);
    return result;
  };
  return thingamabob;
}

export function originsPipe(itimers: ITimer[]): Origins {
  const ts: number[] = itimers.map((itimer: ITimer): number => itimer.origin);
  const wasm: BigInt64Array = new BigInt64Array(ts.map(BigInt));

  return {
    ts,
    wasm,
  } satisfies Origins;
}
