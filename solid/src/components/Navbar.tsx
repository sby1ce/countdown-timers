import { A, useLocation } from "@solidjs/router";
import { type JSX, createMemo } from "solid-js";
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

interface SiblingProps {
  base: string;
  name: string;
  path: `/${string}`;
}

function Sibling(props: SiblingProps): JSX.Element {
  return (
    <details class={styles.details}>
      <summary class={styles.summary}>{props.name}</summary>
      <ul class={styles.ul}>
        <li class={styles.li}>
          <a class={styles.a} href={props.base + props.path}>
            Timers
          </a>
        </li>
        <li class={styles.li}>
          <a class={styles.a} href={props.base + props.path + "/bench"}>
            Benchmark
          </a>
        </li>
      </ul>
    </details>
  );
}

export default function Navbar(): JSX.Element {
  const location = useLocation();
  const base: () => string = createMemo(() => getBase(location.pathname));

  const bench: () => boolean = createMemo(() => isBench(location.pathname));
  const self: JSX.Element = (
    <details open class={styles.details}>
      <summary class={styles.summary}>Solid</summary>
      <ul class={styles.ul}>
        <li
          classList={{
            [styles.li]: true,
            [styles.current]: !bench(),
          }}
        >
          <A href="/" class={styles.a}>
            Timers
          </A>
        </li>
        <li
          classList={{
            [styles.li]: true,
            [styles.current]: bench(),
          }}
        >
          <A href="bench/" class={styles.a}>
            Benchmark
          </A>
        </li>
      </ul>
    </details>
  );

  const root: JSX.Element = (
    <>
      <li class={styles.li}>
        <a href={base() + "/bench"} class={styles.a}>
          Benchmark
        </a>
      </li>
      <li class={styles.li}>
        <a href={base() + "/legal"} class={styles.a}>
          Licences
        </a>
      </li>
    </>
  );

  return (
    <nav class={styles.nav}>
      <ul class={styles.ul}>
        <li class={styles.li}>{self}</li>
        <li class={styles.li}>
          <Sibling base={base()} name="Svelte" path="/svelte" />
        </li>
        {root}
      </ul>
    </nav>
  );
}
