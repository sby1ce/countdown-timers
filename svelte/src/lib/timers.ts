/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { writable } from "svelte/store";
import type { ITimer } from "$cd-lib/timers.ts";
import { load } from "$cd-lib/storage.ts";

export const timers = writable<ITimer[]>(load());
