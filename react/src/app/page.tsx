/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX } from "react";
import TimerBlock from "@/lib/TimerBlock.tsx";
import styles from "./page.module.scss";

export default function Home(): JSX.Element {
  return (
    <div className={styles.div}>
      <h1 className={styles.h1}>Watch countdowns</h1>

      <TimerBlock />
    </div>
  );
}
