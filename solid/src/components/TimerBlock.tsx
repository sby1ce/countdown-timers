/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import {
  For,
  type JSX,
  onCleanup,
  createSignal,
  createRenderEffect,
  onMount,
} from "solid-js";
import {
  type ITimer,
  type TimerFunc,
  type Origins,
  tsTimers,
  originsPipe,
} from "countdown-lib/timers";
import { createTimers } from "./timers.ts";
import { initialize } from "countdown-lib/bench";
import Timer from "./Timer.tsx";
import AddTimer from "./AddTimer.tsx";
import Button, { ButtonStyle } from "./Button.tsx";
import styles from "./TimerBlock.module.scss";

interface UpdateFunc {
  isRs: boolean;
  func: TimerFunc;
}

function switchUpdate(
  rsTimers: () => TimerFunc | undefined,
): (uf: UpdateFunc) => UpdateFunc {
  console.log("switch outer");
  return (updateFunc: UpdateFunc): UpdateFunc => {
    if (updateFunc.isRs) {
      return {
        isRs: false,
        func: tsTimers,
      } satisfies UpdateFunc;
    }
    return {
      isRs: true,
      func: rsTimers()!,
    } satisfies UpdateFunc;
  };
}

export default function TimerBlock(): JSX.Element {
  const [update, setUpdate] = createSignal<UpdateFunc>({
    isRs: false,
    func: tsTimers,
  });
  const [rsTimers, setRsTimers] = createSignal<TimerFunc>(() => {
    throw new Error("wasm failed to load");
  });
  onMount((): void => {
    // Mad side effects
    initialize()
      .then((rsUpdate: TimerFunc): void => {
        setRsTimers(() => rsUpdate);
      })
      .catch((reason) => console.error(reason));
  });
  const switchFunc: () => void = () => setUpdate(switchUpdate(rsTimers));

  const [timers, setTimers] = createTimers();

  const origins: () => Origins = () => originsPipe(timers);

  let interval: ReturnType<typeof setInterval>;
  const [renders, setRenders] = createSignal<string[][]>(
    // eslint-disable-next-line solid/reactivity
    update().func(origins()),
  );
  createRenderEffect(() => {
    interval = setInterval(() => setRenders(update().func(origins())), 1000);
  });
  onCleanup(() => clearInterval(interval));

  return (
    <div class={styles.div}>
      <main class={styles.main}>
        {
          <For each={timers}>
            {(item: ITimer, index: () => number) => (
              <Timer
                id={index()}
                name={item.name}
                countdowns={renders().at(index()) ?? []}
                setTimers={setTimers}
              />
            )}
          </For>
        }
      </main>

      <aside class={styles.aside}>
        <p class={styles.p}>
          Create a <strong>timer</strong> by setting its name and datetime
        </p>

        <article class={styles.article}>
          <AddTimer timers={timers} setTimers={setTimers} />
        </article>

        <form class={styles.form}>
          {/* TODO */}
          <Button click={switchFunc} bg={ButtonStyle.SecondaryBg}>
            Switch {update().isRs ? "WA to JS" : "JS to WA"}
          </Button>
        </form>
      </aside>
    </div>
  );
}
