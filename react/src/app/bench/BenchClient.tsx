/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

"use client";

import dynamic from "next/dynamic";
import { type JSX, useState } from "react";
import { seed, bench1000, formatBrowser } from "$cd-lib/bench.ts";
import {
  type TimerFunc,
  type Origins,
  tsTimers as tsUpdate,
  wasmWrapper,
} from "$cd-lib/timers.ts";
import Button, { ButtonStyle } from "@/lib/Button.tsx";
import styles from "./bench.module.scss";

interface Results {
  ts: number;
  rs: number;
}

function bench(
  setResults: (r: Results | null) => void,
  tsUpdate: TimerFunc,
  rsUpdate: TimerFunc,
): void {
  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const rsAvg: number = bench1000(rsUpdate, origins);

  setResults({
    ts: tsAvg,
    rs: rsAvg,
  } satisfies Results);
}

function BenchClient({ rsUpdate }: { rsUpdate: TimerFunc }): JSX.Element {
  const [results, setResults] = useState<Results | null>(null);

  const run: () => void = () => bench(setResults, tsUpdate, rsUpdate);

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.h2}>TypeScript</h2>
        <p className={styles.p}>{formatBrowser(results?.ts)}</p>
      </section>
      <section className={styles.section}>
        <h2 className={styles.h2}>Rust</h2>
        <p className={styles.p}>{formatBrowser(results?.rs)}</p>
      </section>

      <form className={styles.form}>
        <Button click={run} bg={ButtonStyle.SecondaryBg}>
          Benchmark
        </Button>
      </form>
    </>
  );
}

export default dynamic<{}>(
  async () => {
    const wasm = await import("$wasm");
    const init = wasm.default;
    await init();
    const rsUpdate: TimerFunc = wasmWrapper(wasm.update_timers);

    return function BenchWasm(): JSX.Element {
      return <BenchClient rsUpdate={rsUpdate} />;
    };
  },
  {
    // Without this, it triess to import wasm during build time and fails
    ssr: false,
  },
);
