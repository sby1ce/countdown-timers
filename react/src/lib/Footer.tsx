/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

"use client";

import type { JSX } from "react";
import Button, { ButtonStyle } from "./Button.tsx";
import styles from "./Footer.module.scss";

function clear() {
  if (typeof localStorage !== "undefined" && localStorage?.length) {
    localStorage.clear();
  }
}

export default function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <Button bg={ButtonStyle.Bg} click={clear}>
        Clear localStorage
      </Button>
    </footer>
  );
}
