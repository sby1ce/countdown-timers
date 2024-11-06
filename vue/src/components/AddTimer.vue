<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ref } from "vue";
import type { ITimer } from "../../../countdown-lib/src/timers.ts";
import { useTimers } from "~/timers.ts";
import Button from "./Button.vue";

const name = ref<string>();
const date = ref<string>();
const nameInvalid = ref(false);
const dateInvalid = ref(false);
const form = ref("");

const timers = useTimers();

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

function submit(): void {
  const origin: number | null = getUnix(date.value);
  if (origin === null || Number.isNaN(origin)) {
    form.value = "Entered datetime is invalid";
    dateInvalid.value = true;
    return;
  } else {
    dateInvalid.value = false;
  }

  if (!name.value) {
    form.value = "Timer name should have name";
    nameInvalid.value = true;
    return;
  }

  const key = hashName(name.value);
  for (const timer of timers.inner) {
    if (timer.key === key) {
      form.value = "Timer with the same name already exists";
      nameInvalid.value = true;
      return;
    }
  }

  const timer: ITimer = {
    key,
    name: name.value,
    origin,
  };
  timers.append(timer);

  nameInvalid.value = false;
  name.value = "";
  date.value = "";
  form.value = "";
}
</script>

<template>
  <form :class="$style.form" @submit.prevent="submit">
    <fieldset :class="$style.fieldset">
      <label for="add-name" hidden>Add timer name</label>
      <input
        id="add-name"
        v-model="name"
        type="text"
        placeholder="Timer name here"
        minlength="1"
        :class="[{ [$style.invalid]: nameInvalid }, $style.input]"
      />

      <label for="add-time" hidden>Choose time</label>
      <input
        id="add-time"
        v-model="date"
        type="datetime-local"
        step="0.001"
        :class="[{ [$style.invalid]: dateInvalid }, $style.input]"
      />
    </fieldset>

    <p v-show="form" :class="$style.p">
      <output for="add-name add-time"
        ><small>{{ form }}</small></output
      >
    </p>

    <Button :class="$style.button" type="submit">Add timer</Button>
  </form>
</template>

<style lang="scss" module>
@use "../scss/variables" as v;

.form {
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 0.5em;
}

$error-colour: #ff0000;

.p {
  margin: 0.5em 0 0;
  color: $error-colour;
}

.invalid {
  outline: 0.2em solid $error-colour;
}

.input {
  border: 0;
  border-radius: 0.5em;
  padding: 0.5em;
}

.button {
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
