/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { For, createSignal } from "solid-js";
import Kebab from "./Kebab.tsx";
import styles from "./Timer.module.scss";
import type { SetTimers } from "./timers.ts";

export interface TimerProps {
  id: number;
  name: string;
  countdowns: string[];
  setTimers: SetTimers;
}

function toggle(state: boolean): boolean {
  return !state;
}

function pop(setTimers: SetTimers, id: number): void {
  setTimers((ts) => ts.slice(0, id).concat(ts.slice(id + 1)));
}

export default function Timer(props: TimerProps) {
  const [hidden, setHidden] = createSignal<boolean>(true);
  // Wrapper function overhead due to event binding not being reactive
  const click: () => void = () => pop(props.setTimers, props.id);

  return (
    <article class={styles.article}>
      <h2 class={styles.h2}>{props.name}</h2>

      <section class={styles.section}>
        <For each={props.countdowns}>
          {(countdown) => <p class={styles.p}>{countdown}</p>}
        </For>
      </section>

      {/* hidden is not a reliable attribute */}
      <div
        classList={{
          [styles.hidden]: hidden(),
          [styles.div]: true,
        }}
      >
        <button type="button" onClick={click} class={styles.button}>
          Delete timer
        </button>
        <button
          classList={{
            [styles.settings]: true,
            [styles.button]: true,
          }}
          type="button"
          onClick={[setHidden, toggle]}
        >
          <Kebab height="100%" />
        </button>
      </div>
    </article>
  );
}
