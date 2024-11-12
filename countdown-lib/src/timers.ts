/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

export interface Origins {
  ts: number[];
  wasm: BigInt64Array;
}

export interface ITimer {
  key: string;
  name: string;
  origin: number;
}

export type TimerFunc = (origins: Origins) => string[][];

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

const enum FormatOption {
  Week,
  Day,
  Hour,
  Minute,
  Second,
  Millisecond,
}

function asTimeUnit(formatOption: FormatOption): TimeUnit {
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

function calculateInterval(interval: number, divisor: number): [number, string] {
  const newInterval: number = interval % divisor;
  const unitCount: number = Math.floor(interval / divisor);
  return [newInterval, unitCount.toString()];
}

/* interface Accumulate<T> {
  readonly minusSign: T;
  readonly spaceSign: T;
  accumulate(interval: number, formatOption: FormatOption): [number, ThisType<this>];
  plus(element: T): ThisType<this>;
} */

function accumulate(self: string, interval: number, formatOption: FormatOption): [number, string] {
  const timeUnit: TimeUnit = asTimeUnit(formatOption);
  const [newInterval, unitCount] = calculateInterval(interval, timeUnit.divisor);
  const newAccumulator: string = self + unitCount + timeUnit.suffix + ' ';
  return [newInterval, newAccumulator];
}

function next(formatOptions: FormatOption[]): FormatOption[] {
  return formatOptions.slice(1);
}

function reduceInterval(
  interval: number,
  accumulator: string,
  formatOptions: FormatOption[],
) {
  if (formatOptions.length === 0) {
    return accumulator;
  }
  const formatOption: FormatOption = formatOptions[0];
  const [newInterval, newAccumulator] = accumulate(accumulator, interval, formatOption);

  return reduceInterval(newInterval, newAccumulator, next(formatOptions));
}

function convert(interval: number,
  accumulator: string,
  formatOptions: FormatOption[]): string {
  const absInterval: number = Math.abs(interval);

  const element = '-';
  const newAccumulator: string = interval >= 0 ? "" : element;

  return reduceInterval(absInterval, newAccumulator, formatOptions);
}

function update(accumulators: [string], origin: number, now: number): string[] {
  const interval: number = origin - now;
  const formatOptions: FormatOption[] = [
    FormatOption.Day,
    FormatOption.Hour,
    FormatOption.Minute,
    FormatOption.Second,
  ];

  return accumulators.map((acc) => convert(interval, acc, formatOptions));
}

function updateTimers(now: number, origins: number[]): string[][] {
  const updateAccumulators = (origin: number): string[] => {
    const accumulators: [string] = [""];
    return update(accumulators, origin, now);
  }

  return origins.map(updateAccumulators);
}

export function tsTimers(origins: Origins): string[][] {
  const now: number = Date.now();

  return updateTimers(now, origins.ts);
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
