/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import {
  configureStore,
  type UnknownAction,
  type Unsubscribe,
} from "@reduxjs/toolkit";
import { load, storageAvailable } from "countdown-lib/storage";
import type { ITimer } from "countdown-lib/timers";

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
  if (storageAvailable("localStorage")) {
    localStorage.setItem("timers", JSON.stringify(state));
  }
});
