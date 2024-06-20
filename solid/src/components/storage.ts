/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { isServer } from "solid-js/web";
import type { ITimer } from "./timers.ts";

export function storageAvailable(type: string): boolean {
  let storage;
  try {
    // I don't even know what it wants from me here
    //@ts-expect-error see above
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    storage = window[type];
    const x = "__storage_test__";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    storage.setItem(x, x);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    storage.removeItem(x);
    return true;
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (e instanceof DOMException &&
      (e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      storage.length !== 0) satisfies boolean;
  }
}

export function load(): ITimer[] {
  if (isServer || typeof localStorage === "undefined") {
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(localStorage.getItem("timers"));
}

export function save(timers: ITimer[]): void {
  if (!isServer && storageAvailable("localStorage")) {
    localStorage.setItem("timers", JSON.stringify(timers));
  }
}
