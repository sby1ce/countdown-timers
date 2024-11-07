/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import {
  type ChangeEvent,
  type FormEvent,
  type FormEventHandler,
  useState,
  type JSX,
} from "react";
import clsx from "clsx";
import type { ITimer } from "countdown-lib/timers";
import { appendTimer, timers as timerStore } from "./timers.ts";
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
  setErr: (f: string) => void,
  name: string,
  date: string,
  setName: (s: string) => void,
  setDate: (s: string) => void,
  timers: ITimer[],
  event: FormEvent,
): void {
  event.preventDefault();

  const origin: number | null = getUnix(date);
  if (origin === null || Number.isNaN(origin)) {
    setErr("Entered datetime is invalid");
    setDateValid(false);
    return;
  } else {
    setDateValid(true);
  }

  if (!name) {
    setErr("Timer name should have name");
    setNameValid(false);
    return;
  }

  const key = hashName(name);
  for (const timer of timers) {
    if (timer.key === key) {
      setErr("Timer with the same name already exists");
      setNameValid(false);
      return;
    }
  }

  const timer: ITimer = {
    key,
    name: name,
    origin,
  };
  timerStore.dispatch(appendTimer(timer));

  setNameValid(true);
  setName("");
  setDate("");
  setErr("");
}

export interface AddTimerProps {
  timers: ITimer[];
}

type TChangeEvent = ChangeEvent<HTMLInputElement>;

function syncInput(
  setValue: (value: string) => void,
): (event: TChangeEvent) => void {
  return (event) => setValue(event.target.value);
}

export default function AddTimer({ timers }: AddTimerProps): JSX.Element {
  const [nameValid, setNameValid] = useState<boolean>(true);
  const [dateValid, setDateValid] = useState<boolean>(true);

  const [name, setName] = useState<string>("");
  const addName: JSX.Element = (
    <input
      id="add-name"
      type="text"
      placeholder="Timer name here"
      minLength={1}
      className={clsx(
        {
          [styles.invalid]: !nameValid,
        },
        styles.input,
      )}
      value={name}
      onChange={syncInput(setName)}
    />
  );

  const [date, setDate] = useState<string>("");
  const addTime: JSX.Element = (
    <input
      id="add-time"
      type="datetime-local"
      step="0.001"
      className={clsx(
        {
          [styles.invalid]: !dateValid,
        },
        styles.input,
      )}
      value={date}
      onChange={syncInput(setDate)}
    />
  );

  const [err, setErr] = useState<string>("");

  const formSubmit: FormEventHandler = submit.bind(
    null,
    setNameValid,
    setDateValid,
    setErr,
    name,
    date,
    setName,
    setDate,
    timers,
  );

  return (
    <form onSubmit={formSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <label htmlFor="add-name" hidden>
          Add timer name
        </label>
        {addName}

        <label htmlFor="add-time" hidden>
          Choose time
        </label>
        {addTime}
      </fieldset>

      {err.length > 0 && (
        <p className={styles.p}>
          <output>
            <small>{err}</small>
          </output>
        </p>
      )}

      <button type="submit" className={styles.button}>
        Add timer
      </button>
    </form>
  );
}
