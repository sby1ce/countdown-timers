/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { createResource, createSignal, type JSX } from "solid-js";
import Button, { ButtonStyle } from "~/components/Button.tsx";
import {
  initialize,
  seed,
  bench1000,
  formatBrowser,
} from "~/components/bench.ts";
import {
  tsTimers as tsUpdate,
  type TimerFunc,
  type Origins,
} from "~/components/timers.ts";
import styles from "~/scss/bench.module.scss";

interface Results {
  ts: number;
  rs: number;
}

function bench(
  setResults: (r: Results | null) => void,
  tsUpdate: TimerFunc,
  rsTimers: () => TimerFunc | undefined,
): void {
  const rsUpdate: TimerFunc | undefined = rsTimers();
  if (rsUpdate === undefined) {
    return;
  }

  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const rsAvg: number = bench1000(rsUpdate, origins);

  setResults({
    ts: tsAvg,
    rs: rsAvg,
  } satisfies Results);
}

export default function Bench(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rsUpdate, _yes] = createResource<TimerFunc, unknown>(initialize);

  const [results, setResults] = createSignal<Results | null>(null);

  const run: () => void = () => bench(setResults, tsUpdate, rsUpdate);

  return (
    <main class={styles.main}>
      <h1 class={styles.h1}>Benchmarks</h1>
      <p class={styles.p}>
        Average time over 1000 function runs in microseconds
      </p>

      <section class={styles.section}>
        <h2 class={styles.h2}>TypeScript</h2>
        <p class={styles.p}>{formatBrowser(results()?.ts)}</p>
      </section>
      <section class={styles.section}>
        <h2 class={styles.h2}>Rust</h2>
        <p class={styles.p}>{formatBrowser(results()?.rs)}</p>
      </section>

      <p class={styles.p}>Press the button to run the benchmark</p>

      <form class={styles.form}>
        <Button click={run} bg={ButtonStyle.SecondaryBg}>
          Benchmark
        </Button>
      </form>
    </main>
  );
}
