/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

"use client";

import { useEffect, useState, type JSX } from "react";
import { Provider } from "react-redux";
import {
  originsPipe,
  timers,
  tsTimers,
  type ITimer,
  type TimerFunc,
  type Origins,
  INIT_TIMERS,
} from "./timers.ts";
import Timer from "./Timer.tsx";
import AddTimer from "./AddTimer.tsx";
import Button, { ButtonStyle } from "./Button.tsx";
import styles from "./TimerBlock.module.scss";

interface UpdateFunc {
  isRs: boolean;
  func: TimerFunc;
}

function switchUpdate(updateFunc: UpdateFunc): UpdateFunc {
  if (updateFunc.isRs) {
    return {
      isRs: false,
      func: tsTimers,
    } satisfies UpdateFunc;
  }
  return {
    isRs: true,
    // TODO
    func: tsTimers,
  } satisfies UpdateFunc;
}

function TimerBlock(): JSX.Element {
  const [update, setUpdate] = useState<UpdateFunc>({
    isRs: false,
    func: tsTimers,
  });
  const switchFunc: () => void = () => setUpdate(switchUpdate);

  // Idk what causes this to be undefined
  const state: ITimer[] = timers.getState() ?? [];
  const origins: Origins = originsPipe(state);

  // renders only gets access to the data after the DOM loads
  // so by creating initial renders, the Timer element with already rendered strings
  // still doesn't fix the initial tick before the Timer elements themselves load
  const initial = update.func(origins);
  const [renders, setRenders] = useState(initial);

  // Loading from localStorage as in onMount basically??
  useEffect(() => {
    timers.dispatch(INIT_TIMERS);
  }, []);

  useEffect(() => {
    const interval: ReturnType<typeof setInterval> = setInterval(
      () => setRenders(update.func(origins)),
      1000,
    );
    return () => clearInterval(interval);
  });

  return (
    <div className={styles.div}>
      <main className={styles.main}>
        {state.map((item: ITimer, index: number) => (
          <Timer
            key={item.key}
            id={index}
            name={item.name}
            countdowns={renders.at(index) ?? initial.at(index) ?? []}
          />
        ))}
      </main>

      <aside className={styles.aside}>
        <p className={styles.p}>
          Create a <strong>timer</strong> by setting its name and datetime
        </p>

        <article className={styles.article}>
          <AddTimer timers={state} />
        </article>

        <form className={styles.form}>
          {/* TODO */}
          <Button click={switchFunc} bg={ButtonStyle.SecondaryBg}>
            Switch
          </Button>
        </form>
      </aside>
    </div>
  );
}

export default function TimerWrapper(): JSX.Element {
  // Creating a wrapper because of redux provider
  return (
    <Provider store={timers}>
      <TimerBlock />
    </Provider>
  );
}
