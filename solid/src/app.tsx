/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Navbar from "~/components/Navbar.tsx";
import styles from "~/scss/layout.module.scss";
import "./app.scss";

export default function App() {
  return (
    <Router
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      base={import.meta.env.VITE_PATH}
      root={(props) => (
        <MetaProvider>
          <Suspense>
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
