import {
  For,
  type JSX,
  onCleanup,
  createSignal,
  createRenderEffect,
} from "solid-js";
import Timer from "./Timer.tsx";
import AddTimer from "./AddTimer.tsx";
import Button, { ButtonStyle } from "./Button.tsx";
import {
  type ITimer,
  type TimerFunc,
  type Origins,
  createTimers,
  tsTimers,
  originsPipe,
} from "./timers.ts";
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

export default function TimerBlock(): JSX.Element {
  // TODO rsTimers
  const [update, setUpdate] = createSignal<UpdateFunc>({
    isRs: false,
    func: tsTimers,
  });
  // TODO this is suboptimal
  const switchFunc: () => void = () => setUpdate(switchUpdate);

  const [timers, setTimers] = createTimers();

  const origins: () => Origins = () => originsPipe(timers);

  let interval: ReturnType<typeof setInterval>;
  const [renders, setRenders] = createSignal<string[][]>([]);
  createRenderEffect(() => {
    setRenders(update().func(origins()));

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
            Switch
          </Button>
        </form>
      </aside>
    </div>
  );
}
