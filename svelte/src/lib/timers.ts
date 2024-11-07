/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { writable } from "svelte/store";
import type { ITimer } from "countdown-lib/timers";
import { load } from "countdown-lib/storage";

export const timers = writable<ITimer[]>(load());
