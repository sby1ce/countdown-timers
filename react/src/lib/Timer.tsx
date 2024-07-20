/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

"use client";

import { useState } from "react";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import Kebab from "./Kebab.tsx";
import { removeTimer } from "./timers.ts";
import styles from "./Timer.module.scss";

export interface TimerProps {
  id: number;
  name: string;
  countdowns: string[];
}

function toggle(state: boolean): boolean {
  return !state;
}

export default function Timer({ id, name, countdowns }: TimerProps) {
  const [hidden, setHidden] = useState<boolean>(true);
  const toggleSettings: () => void = () => setHidden(toggle);

  const dispatch = useDispatch();
  const popTimer: () => void = () => dispatch(removeTimer(id));

  return (
    <article className={styles.article}>
      <h2 className={styles.h2}>{name}</h2>

      <section className={styles.section}>
        {countdowns.map((countdown, key) => (
          <p key={key} className={styles.p}>
            {countdown}
          </p>
        ))}
      </section>

      {/* hidden is not a reliable attribute */}
      <div
        className={clsx(
          {
            [styles.hidden]: hidden,
          },
          styles.div,
        )}
      >
        <button type="button" onClick={popTimer} className={styles.button}>
          Delete timer
        </button>
        <button
          className={clsx(styles.settings, styles.button)}
          type="button"
          onClick={toggleSettings}
        >
          <Kebab height="100%" />
        </button>
      </div>
    </article>
  );
}
