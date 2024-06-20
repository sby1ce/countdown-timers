/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { JSX } from "solid-js";
import styles from "./Kebab.module.scss";

export default function Kebab(props: { height: string }): JSX.Element {
  return (
    <svg
      class={styles.kebab}
      xmlns="http://www.w3.org/2000/svg"
      height={props.height}
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="4" r="3" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="20" r="3" />
    </svg>
  );
}
