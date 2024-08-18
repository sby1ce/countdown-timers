/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX } from "react";
import NavClient from "./NavClient";
import styles from "./Navbar.module.scss";

interface SiblingProps {
  base: string;
  name: string;
  path: `/${string}`;
}

function Sibling(props: SiblingProps): JSX.Element {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>{props.name}</summary>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <a className={styles.a} href={props.base + props.path}>
            Timers
          </a>
        </li>
        <li className={styles.li}>
          <a className={styles.a} href={props.base + props.path + "/bench"}>
            Benchmark
          </a>
        </li>
      </ul>
    </details>
  );
}

export default function Navbar(): JSX.Element {
  const base: string | undefined = process.env.PARENT_PATH;
  if (base === undefined) {
    // TODO delete this check
    throw new Error("No base env var");
  }

  const self: JSX.Element = (
    <details open className={styles.details}>
      <summary className={styles.summary}>React</summary>
      <NavClient />
    </details>
  );

  const root: JSX.Element = (
    <>
      <li className={styles.li}>
        <a href={base + "/bench"} className={styles.a}>
          Benchmark
        </a>
      </li>
      <li className={styles.li}>
        <a href={base + "/legal"} className={styles.a}>
          Licences
        </a>
      </li>
    </>
  );

  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>{self}</li>
        <li className={styles.li}>
          <Sibling base={base} name="Solid" path="/solid" />
          <Sibling base={base} name="Svelte" path="/svelte" />
          <Sibling base={base} name="Vue" path="/vue" />
        </li>
        {root}
      </ul>
    </nav>
  );
}
