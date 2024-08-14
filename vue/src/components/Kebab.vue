<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
interface KebabProps {
  height?: string;
}

withDefaults(defineProps<KebabProps>(), { height: "100%" });
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :height="height" viewBox="0 0 24 24">
    <circle cx="12" cy="4" r="3" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="20" r="3" />
  </svg>
</template>

<style lang="scss" module>
@use "~/scss/variables" as v;

svg {
  fill: v.$text-colour;
}
</style>
