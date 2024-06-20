/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX } from "solid-js";
import TimerBlock from "~/components/TimerBlock.tsx";
import styles from "~/scss/index.module.scss";

export default function Home(): JSX.Element {
  return (
    <div>
      <h1 class={styles.h1}>Watch countdowns</h1>

      <TimerBlock />
    </div>
  );
}
