/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { type SetStoreFunction, createStore } from "solid-js/store";
import { createEffect, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { load, storageAvailable } from "../../../countdown-lib/src/storage.ts";
import type { ITimer } from "../../../countdown-lib/src/timers.ts";

export type SetTimers = SetStoreFunction<ITimer[]>;

/** Timers store that is only meant to be created in one place
 *
 * # Side effects
 *
 * `setTimers` automatically handles syncing with localStorage
 */
export function createTimers(): [ITimer[], SetTimers] {
  const [timers, setTimers] = createStore<ITimer[]>([]);
  // onMount prevents desync on server and browser during dev
  // which causes hydration mismatch with `<For/>`
  onMount(() => setTimers(isServer ? [] : load()));
  createEffect(() => {
    if (!isServer && storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify(timers));
    }
  });
  return [timers, setTimers];
}
