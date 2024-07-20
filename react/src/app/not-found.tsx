/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX } from "react";
import styles from "./not-found.module.scss";

export default function NotFound(): JSX.Element {
  return (
    <div className={styles.div}>
      <h1>404 Not found</h1>
    </div>
  );
}
