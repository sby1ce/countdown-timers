/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { type JSX, useMemo } from "react";
import clsx from "clsx";
import styles from "./Navbar.module.scss";

/** https://stackoverflow.com/a/55292366 */
function trimEnd(pathname: string): string {
  let end: number = pathname.length;
  while (end > 0 && pathname[end - 1] === "/") {
    --end;
  }
  const path: string = pathname.slice(0, end);
  return path.length !== 0 ? path : "/";
}

/** Hardcoding a path here because too much effort
 * TODO: write a test for this
 */
function getBase(pathname: string): string {
  const lastWordIndex = pathname.lastIndexOf("/solid");
  return trimEnd(
    lastWordIndex !== -1 ? pathname.slice(0, lastWordIndex) : pathname,
  );
}

function isBench(pathname: string): boolean {
  return pathname.lastIndexOf("/bench") !== -1;
}

export default function NavClient(): JSX.Element {
  const pathname: string = usePathname();
  const base: string = useMemo(() => getBase(pathname), [pathname]);

  const bench: boolean = useMemo(() => isBench(pathname), [pathname]);

  return (
    <ul className={styles.ul}>
      <li
        className={clsx(styles.li, {
          [styles.current]: !bench,
        })}
      >
        <Link href="/" className={styles.a}>
          Timers
        </Link>
      </li>
      <li
        className={clsx(styles.li, {
          [styles.current]: bench,
        })}
      >
        <Link href="/bench" className={styles.a}>
          Benchmark
        </Link>
      </li>
    </ul>
  );
}
