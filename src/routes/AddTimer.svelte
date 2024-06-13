<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { timers, type ITimer } from "$lib/timers";
  import { storageAvailable } from "$lib/storage";

  let name: HTMLInputElement;
  let date: HTMLInputElement;
  let form: string = "";

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

  function submit(event: Event): void {
    const origin: number | null = getUnix(date.value);
    if (origin === null || Number.isNaN(origin)) {
      form = "Entered datetime is invalid";
      event.preventDefault();
      return;
    }

    if (!name.value) {
      form = "Timer name should have name";
      event.preventDefault();
      return;
    }

    const key = hashName(name.value);
    for (const timer of $timers) {
      if (timer.key === key) {
        form = "Timer with the same name already exists";
        event.preventDefault();
        return;
      }
    }

    const timer: ITimer = {
      key,
      name: name.value,
      origin,
    };
    timers.update((t) => [...t, timer]);

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify($timers));
    }

    form = "";
  }
</script>

<form on:submit={submit}>
  <fieldset>
    <label for="add-name" hidden>Add timer name</label>
    <input
      bind:this={name}
      id="add-name"
      type="text"
      placeholder="Timer name here"
      minlength="1"
    />

    <label for="add-time" hidden>Choose time</label>
    <input bind:this={date} id="add-time" type="datetime-local" step="0.001" />
  </fieldset>

  {#if form}
    <p><small>{form}</small></p>
  {/if}

  <button type="submit"> Add timer </button>
</form>

<style lang="scss">
  @use "$lib/variables" as v;

  form {
    border: 0;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 0.5em;
  }

  p {
    margin: 0.5em 0 0;
  }

  input {
    border: 0;
    border-radius: 0.5em;
    padding: 0.5em;
  }

  button {
    font-family: inherit;
    background-color: v.$bg-colour;
    color: v.$text-colour;
    border: 0;
    border-radius: 0.5em;
    padding: 1em;
    margin-top: 1em;

    &:hover {
      box-shadow: 0 0 2em v.$primary-colour;
    }

    &:active {
      outline: solid v.$primary-colour;
    }
  }
</style>
