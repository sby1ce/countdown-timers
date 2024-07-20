/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { ITimer } from "./timers.ts";

export function storageAvailable(type: string): boolean {
  let storage;
  try {
    // I don't even know what it wants from me here
    //@ts-expect-error see above
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (e instanceof DOMException &&
      (e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0) satisfies boolean;
  }
}

export function load(): ITimer[] {
  if (typeof localStorage === "undefined") {
    return [];
  }

  const temp: ITimer[] = [
    {
      key: "Timer 0",
      name: "Timer 0 name",
      origin: 0,
    },
    {
      key: "Timer 1",
      name: "Timer 1 here",
      origin: 1696174196000,
    },
    {
      key: "Timer 2",
      name: "IYKYK",
      origin: 1607025600000,
    },
  ];

  if (
    !storageAvailable("localStorage") ||
    localStorage.getItem("timers") === null ||
    localStorage.getItem("timers") === "[]" ||
    localStorage.getItem("timers") === "{}"
  ) {
    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify(temp));
    }
    return temp;
  }
  // getItem theoretically never returns null but TS doesn't know
  //@ts-expect-error see above
  return JSON.parse(localStorage.getItem("timers"));
}

export function save(timers: ITimer[]): void {
  if (storageAvailable("localStorage")) {
    localStorage.setItem("timers", JSON.stringify(timers));
  }
}
