/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { shallowRef } from "vue";
import { defineStore } from "pinia";
import type { ITimer } from "countdown-lib/timers";
import { load, storageAvailable } from "countdown-lib/storage";

export const useTimers = defineStore("timers", () => {
  const inner = shallowRef<ITimer[]>([]);

  function init(): void {
    inner.value = load();
  }

  function pop(id: number): void {
    const data = inner.value;
    inner.value = data.slice(0, id).concat(data.slice(id + 1));

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify(inner.value));
    }
  }

  function append(timer: ITimer): void {
    const data = inner.value;
    inner.value = [...data, timer];

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify(inner.value));
    }
  }

  return { inner, init, pop, append };
});
