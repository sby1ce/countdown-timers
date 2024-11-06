<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import {
  tsTimers as tsUpdate,
  type Origins,
  type TimerFunc,
} from "../../../countdown-lib/src/timers.ts";
import {
  initialize,
  seed,
  bench1000,
  formatBrowser,
} from "../../../countdown-lib/src/bench.ts";
import Button from "~/components/Button.vue";
import { ButtonStyle } from "~/utils.ts";

const rsUpdate = ref<TimerFunc>();

onBeforeMount(async () => {
  rsUpdate.value = await initialize();
});

interface Results {
  ts: number;
  rs: number;
}

const results = ref<Results>();

function bench(): void {
  const origins: Origins = seed();

  const tsAvg: number = bench1000(tsUpdate, origins);
  const rsAvg: number = bench1000(rsUpdate.value!, origins);

  results.value = {
    ts: tsAvg,
    rs: rsAvg,
  } satisfies Results;
}
</script>

<template>
  <main :class="$style.main">
    <h1 :class="$style.h1">Benchmarks</h1>
    <p :class="$style.p">
      Average time over 1000 function runs in microseconds
    </p>

    <section :class="$style.section">
      <h2 :class="$style.h2">TypeScript</h2>
      <p :class="$style.p">{{ formatBrowser(results?.ts) }}</p>
    </section>
    <section :class="$style.section">
      <h2 :class="$style.h2">Rust</h2>
      <p :class="$style.p">{{ formatBrowser(results?.rs) }}</p>
    </section>

    <p :class="$style.p">Press the button to run the benchmark</p>

    <form :class="$style.form">
      <Button :color="ButtonStyle.SecondaryBg" @click="bench">
        Benchmark
      </Button>
    </form>
  </main>
</template>

<style lang="scss" module>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.h1,
.h2 {
  font-weight: normal;
}

.section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.h2,
.p,
.form {
  margin: 1em 0 1em 0;
}
</style>
