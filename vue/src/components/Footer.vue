<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import Button from "~/components/Button.vue";

function clear() {
  if (localStorage?.length) {
    // localStorage.clear();
    // nuxt appears to have own things in there
    delete localStorage["timers"];
  }
}
</script>

<template>
  <footer>
    <Button @click="clear">Clear localStorage</Button>
  </footer>
</template>

<style lang="scss" module>
@use "../scss/variables" as v;

footer {
  margin: 0;
  border: 0;
  padding: 1.5rem 0 1.5rem 0;
  border-top: 0.5rem solid v.$primary-colour;
  inline-size: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: v.$secondary-bg-colour;
  box-shadow: 0 50vh 0 50vh v.$secondary-bg-colour;
}
</style>
