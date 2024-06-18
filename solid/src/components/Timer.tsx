/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { createSignal } from "solid-js";
import "./Timer.module.css";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button
      class="increment"
      onClick={() => setCount(count() + 1)}
      type="button"
    >
      Clicks: {count()}
    </button>
  );
}
