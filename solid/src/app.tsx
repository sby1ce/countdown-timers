/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { Link, Meta, MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, type JSX } from "solid-js";
import Navbar from "~/components/Navbar.tsx";
import styles from "~/scss/layout.module.scss";
import "./app.scss";

function Favicons(props: { base: string }): JSX.Element {
  return (
    <>
      <Link
        rel="apple-touch-icon"
        sizes="180x180"
        href={props.base + "/apple-touch-icon.png"}
      />
      <Link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={props.base + "/favicon-32x32.png"}
      />
      <Link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={props.base + "/favicon-16x16.png"}
      />
      <Link rel="manifest" href={props.base + "/site.webmanifest"} />
      <Link rel="mask-icon" href={props.base + "/safari-pinned-tab.svg"} color="#5bbad5" />
      <Meta name="msapplication-TileColor" content="#000000" />
      <Meta name="msapplication-config" content="/countdown-timers/solid/browserconfig.xml" />
      <Meta name="theme-color" content="#ffffff" />
    </>
  );
}

function Metadata(): JSX.Element {
  return (
    <>
      <Meta property="og:title" content="Countdown Timers" />
      <Meta property="og:type" content="website" />
      <Meta
        property="og:description"
        content="Watch timers count down"
      />
      <Meta
        property="og:url"
        content="https://sby1ce.github.io/countdown-timers"
      />
      <Meta property="og:updated_time" content="2024-06-20" />
    </>
  );
}

export default function App(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const base: string = import.meta.env.VITE_PATH;
  return (
    <Router
      base={base}
      root={(props) => (
        <MetaProvider>
          <Suspense>
            <Favicons base={base} />
            <Metadata />

            <div class={styles.div}>
              <Navbar />
              {props.children}
            </div>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
