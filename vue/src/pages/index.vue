<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import TimerBlock from "~/components/TimerBlock.vue";
</script>

<template>
  <div :class="$style.div">
    <h1 :class="$style.h1">Watch countdowns</h1>

    <TimerBlock />
  </div>
</template>

<style lang="scss" module>
.div {
  display: grid;
  grid-template-rows: auto 1fr;
}

.h1 {
  font-weight: normal;
  text-indent: 4ex;
}

@media (max-width: 400px) {
  .h1 {
    text-indent: 0;
    text-align: center;
  }
}
</style>
