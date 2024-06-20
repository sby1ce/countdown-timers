/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { createSignal, type JSX, Show } from "solid-js";
import type { ITimer, SetTimers } from "./timers.ts";
import styles from "./AddTimer.module.scss";

function getUnix(str: string | undefined): number | null {
  if (!str) {
    return null;
  }
  try {
    const date = new Date(str);

    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    );
  } catch {
    return null;
  }
}

function hashName(timerName: string): string {
  return `timer${Array.from(timerName).reduce(
    (hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
    0,
  )}`;
}

function submit(
  setNameValid: (b: boolean) => void,
  setDateValid: (b: boolean) => void,
  setForm: (f: string) => void,
  name: HTMLInputElement,
  date: HTMLInputElement,
  timers: ITimer[],
  setTimers: SetTimers,
  event: SubmitEvent,
): void {
  const origin: number | null = getUnix(date.value);
  if (origin === null || Number.isNaN(origin)) {
    setForm("Entered datetime is invalid");
    setDateValid(false);
    event.preventDefault();
    return;
  } else {
    setDateValid(true);
  }

  if (!name.value) {
    setForm("Timer name should have name");
    setNameValid(false);
    event.preventDefault();
    return;
  }

  const key = hashName(name.value);
  for (const timer of timers) {
    if (timer.key === key) {
      setForm("Timer with the same name already exists");
      setNameValid(false);
      event.preventDefault();
      return;
    }
  }

  const timer: ITimer = {
    key,
    name: name.value,
    origin,
  };
  // Magic Solid stores syntax
  setTimers(timers.length, timer);

  setNameValid(true);
  name.value = "";
  date.value = "";
  setForm("");
}

export interface AddTimerProps {
  timers: ITimer[];
  setTimers: SetTimers;
}

export default function AddTimer(props: AddTimerProps): JSX.Element {
  const [nameValid, setNameValid] = createSignal<boolean>(true);
  const [dateValid, setDateValid] = createSignal<boolean>(true);

  let refName!: HTMLInputElement;
  const addName: JSX.Element = (
    <input
      ref={(el) => (refName = el)}
      id="add-name"
      type="text"
      placeholder="Timer name here"
      minlength={1}
      classList={{
        [styles.invalid]: !nameValid(),
        [styles.input]: true,
      }}
    />
  );
  let refTime!: HTMLInputElement;
  const addTime: JSX.Element = (
    <input
      ref={(el) => (refTime = el)}
      id="add-time"
      type="datetime-local"
      step="0.001"
      classList={{
        [styles.invalid]: !dateValid(),
        [styles.input]: true,
      }}
    />
  );
  const [form, setForm] = createSignal<string>("");

  // Wrapper function overhead due to event binding not being reactive
  const formSubmit: (e: SubmitEvent) => void = (event: SubmitEvent): void =>
    submit(
      setNameValid,
      setDateValid,
      setForm,
      refName,
      refTime,
      props.timers,
      props.setTimers,
      event,
    );

  return (
    <form onSubmit={formSubmit} class={styles.form}>
      <fieldset class={styles.fieldset}>
        <label for="add-name" hidden>
          Add timer name
        </label>
        {addName}

        <label for="add-time" hidden>
          Choose time
        </label>
        {addTime}
      </fieldset>

      <Show when={Boolean(form())}>
        <p class={styles.p}>
          <small>{form()}</small>
        </p>
      </Show>

      <button type="submit" class={styles.button}>
        Add timer
      </button>
    </form>
  );
}
