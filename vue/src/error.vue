<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { NuxtError } from "#app";

interface ErrorProps {
  error: NuxtError;
}

defineProps<ErrorProps>();
</script>

<template>
  <h1>
    {{ error.statusCode }}
    <template v-if="error.cause">{{ error.cause }}</template>
  </h1>
</template>

<style lang="scss" scoped>
h1 {
  font-family: inherit;
}
</style>
