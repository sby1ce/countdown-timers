/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { error } from "@sveltejs/kit";

export function load(): void {
  error(404, "Not Found");
}
