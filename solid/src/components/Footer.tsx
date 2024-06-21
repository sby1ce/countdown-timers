/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX } from "solid-js";
import { isServer } from "solid-js/web";
import Button, { ButtonStyle } from "./Button.tsx";
import styles from "./Footer.module.scss";

function clear() {
  if (!isServer && localStorage?.length) {
    localStorage.clear();
  }
}

export default function Footer(): JSX.Element {
  return (
    <footer class={styles.footer}>
      <Button bg={ButtonStyle.Bg} click={clear}>Clear localStorage</Button>
    </footer>
  );
}
