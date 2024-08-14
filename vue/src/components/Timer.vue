<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ref } from "vue";

interface TimerEmits {
  (e: "pop"): void;
}
interface TimerProps {
  name: string;
  countdowns: string[];
}

defineEmits<TimerEmits>();
const props = defineProps<TimerProps>();
const hidden = ref(true);

function toggle(): void {
  hidden.value = !hidden.value;
}
</script>

<template>
  <article :class="$style.article">
    <h2 :class="$style.h2">{{ props.name }}</h2>

    <section :class="$style.section">
      <p
        v-for="(countdown, position) in countdowns"
        :key="position"
        :class="$style.p"
      >
        {{ countdown }}
      </p>
    </section>

    <!-- hidden is not a reliable attribute -->
    <div :class="[{ [$style.hidden]: hidden }, $style.div]">
      <button :class="$style.button" type="button" @click="$emit('pop')">
        Delete timer
      </button>

      <button :class="[$style.button, $style.settings]" type="button" @click="toggle">
        <Kebab />
      </button>
    </div>
  </article>
</template>

<style lang="scss" module>
@use "../scss/variables" as v;

$padding: 0.5em;

.article {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-inline-size: min-content;
  inline-size: max(90%, 300px);
  border-radius: 0.5rem;
  margin: 0.5em 0 0.5em 0;
  padding: $padding;
  background-color: v.$secondary-bg-colour;
  box-shadow: 1px 1px 5px rgba(v.$secondary-bg-colour, 0.8);
}

.h2 {
  font-weight: normal;
  color: v.$primary-colour;
  margin: 0;
}

.section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.p {
  margin: 0 1em 0 1em;
}

.settings {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  block-size: 50%;
  inline-size: 2rem; // hack value to sync firefox and chromium
  visibility: visible;
  color: transparent;
  background-color: v.$secondary-bg-colour;
  box-shadow: 0 0 5px rgba(v.$text-colour, 0.5);

  &:hover {
    background-color: rgba(v.$primary-colour, 0.8);
  }
}

.div {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  right: $padding;
  block-size: 100%;
  margin: 0;
  padding: 0;
}

.button {
  font-family: inherit;
  background-color: v.$bg-colour;
  color: v.$text-colour;
}

.hidden {
  visibility: hidden;
}
</style>
