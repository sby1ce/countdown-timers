/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX } from "react";
import BenchClient from "./BenchClient.tsx";
import styles from "./bench.module.scss";

export default async function Bench(): Promise<JSX.Element> {
  return (
    <main className={styles.main}>
      <h1 className={styles.h1}>Benchmarks</h1>
      <p className={styles.p}>
        Average time over 1000 function runs in microseconds
      </p>

      <p className={styles.p}>Press the button to run the benchmark</p>

      <BenchClient />
    </main>
  );
}
