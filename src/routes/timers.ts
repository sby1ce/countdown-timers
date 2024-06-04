import { writable } from "svelte/store";
import { loadFromLocalStorage } from "./storage";

export const timers = writable(loadFromLocalStorage());

interface ITimer {
  key: string;
  name: string;
  origin: number;
  timerStrings: string[];
}

enum FormatOption {
  week = "week",
  day = "day",
  hour = "hour",
  minute = "minute",
  second = "second",
  millisecond = "millisecond",
}

interface TimeUnit {
  key: string;
  divisor: number;
  suffix: string;
}

const timeUnits: TimeUnit[] = [
  { key: "week", divisor: 1000 * 60 * 60 * 24 * 7, suffix: "w" },
  { key: "day", divisor: 1000 * 60 * 60 * 24, suffix: "d" },
  { key: "hour", divisor: 1000 * 60 * 60, suffix: "h" },
  { key: "minute", divisor: 1000 * 60, suffix: "m" },
  { key: "second", divisor: 1000, suffix: "s" },
  { key: "millisecond", divisor: 1, suffix: "ms" },
];

export function newTimers(timers: ITimer[], formatObjects: Object[]) {
  const now: number = Date.now();

  const formats: FormatOption[][] = toFormats(formatObjects);

  return timers.map((timer) => {
    timer.timerStrings = updateTimer(timer, now, formats);
    return timer;
  });
}

function toFormats(formatObjects: Object[]): FormatOption[][] {
  return formatObjects.map(objectToFormat);
}

function objectToFormat(formatObject: Object): FormatOption[] {
  const format: FormatOption[] = [];

  for (const [key, value] of Object.entries(formatObject)) {
    if (value) {
      const enumKey = key.toLowerCase() as keyof typeof FormatOption;
      format.push(FormatOption[enumKey]);
    }
  }

  return format;
}

function matchStringToEnum(str: string): FormatOption | undefined {
  return Object.values(FormatOption).find((option) => option === str) || undefined;
}

function updateTimer(timer: ITimer, now: number, formats: FormatOption[][]): string[] {
  const distance: number = timer.origin - now;

  return formats.map((format) => convertDateToString(distance, format));
}

function convertDateToString(interval: number, format: FormatOption[]): string {
  const absInterval: number = Math.abs(interval);

  const result: string = reduceTimeUnits(timeUnits, format, absInterval);

  return interval < 0 ? `-${result}` : result;
}

function reduceTimeUnits(
  timeUnits: TimeUnit[],
  format: FormatOption[],
  interval: number,
  result: string = "",
) {
  if (!timeUnits.length) {
    return result.trim();
  }

  const enumOption: FormatOption | undefined = matchStringToEnum(timeUnits[0].key);
  if (!enumOption || !format.includes(enumOption)) {
    return reduceTimeUnits(timeUnits.slice(1), format, interval, result);
  }

  const divisor = timeUnits[0].divisor;
  const value = String(Math.floor(interval / divisor));

  const accInterval = interval % divisor;
  const accResult = result + value + timeUnits[0].suffix + " ";
  return reduceTimeUnits(timeUnits.slice(1), format, accInterval, accResult);
}
