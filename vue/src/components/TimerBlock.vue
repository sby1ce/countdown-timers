<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from "vue";
import {
  tsTimers,
  wasmWrapper,
  type Origins,
  type TimerFunc,
  originsPipe,
  useTimers,
} from "~/timers.ts";
import Timer from "~/components/Timer.vue";
import AddTimer from "~/components/AddTimer.vue";
import Button from "~/components/Button.vue";
import { ButtonStyle } from "~/utils.ts";
import init, { update_timers } from "../../../countdown-rs/pkg";

const isInitialized = ref(false);
const rsTimers = ref<TimerFunc>(() => {
  throw new Error("wasm failed to load");
});
const isRs = ref(false);
const updateTimers = ref<TimerFunc>(tsTimers);

async function initialize(): Promise<void> {
  if (isInitialized.value) {
    return;
  }
  try {
    await init();
    rsTimers.value = wasmWrapper(update_timers);
  } catch (e) {
    console.error(e);
  }
  isInitialized.value = true;
}

async function switchFunc(): Promise<void> {
  // Different behaviour from other
  // because background async loading is not supported
  await initialize();
  updateTimers.value = isRs.value ? tsTimers : rsTimers.value;
  isRs.value = !isRs.value;
}

const timers = useTimers();

const origins = computed<Origins>(() => originsPipe(timers.inner));
const renders = ref<string[][]>(updateTimers.value(origins.value));

let interval: ReturnType<typeof setInterval>;
onBeforeMount(() => {
  interval = setInterval(() => {
    renders.value = updateTimers.value(origins.value);
  }, 1000);

  timers.init();
});
onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div :class="$style.div">
    <main :class="$style.main">
      <ClientOnly>
        <Timer
          v-for="(timer, position) in timers.inner"
          :key="timer.key"
          :name="timer.name"
          :countdowns="renders.at(position) ?? []"
          @pop="() => timers.pop(position)"
        />
      </ClientOnly>
    </main>

    <aside :class="$style.aside">
      <p :class="$style.p">
        Create a <strong>timer</strong> by setting its name and datetime
      </p>

      <article :class="$style.article">
        <AddTimer />
      </article>

      <form :class="$style.form">
        <Button :color="ButtonStyle.SecondaryBg" @click="switchFunc">
          Switch {{ isRs ? "WA to JS" : "JS to WA" }}
        </Button>
      </form>
    </aside>
  </div>
</template>

<style lang="scss" module>
@use "../scss/variables" as v;

.div {
  margin: 0;
  padding: 0;
  inline-size: 100%;
  display: grid;
  grid-template-columns: 4fr minmax(0, 1fr);
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.aside {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-left: 0.5em solid v.$primary-colour;
  display: flex;
  flex-direction: column;
  align-items: start;
}

@media (max-width: 400px) {
  .div {
    grid-template-columns: 1fr;
  }
}

@mixin aside-item {
  height: min-content;
  padding: 1em;
  margin: 0;
}

.p {
  @include aside-item;
}

.article {
  @include aside-item;
  width: calc(100% - 2em);
  background-color: v.$secondary-bg-colour;
}

.form {
  @include aside-item;
  width: calc(100% - 2em);
}
</style>
