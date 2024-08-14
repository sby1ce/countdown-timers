<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import Footer from "~/components/Footer.vue";
import Navbar from "~/components/Navbar.vue";

// favicon in nuxt.config
// eslint-disable-next-line no-undef
useHead({
  meta: [{ property: "og:updated_time", content: "2024-08-14" }],
});
// eslint-disable-next-line no-undef
useSeoMeta({
  title: "Countdown Timers",
  description: "Watch timers count down",
  ogTitle: "Countdown Timers",
  ogType: "website",
  ogDescription: "Watch timers count down",
  ogUrl: "https://sby1ce.github.io/countdown-timers",
  // no ogUpdateTime...
});
</script>

<template>
  <div>
    <Navbar />
    <slot />
  </div>

  <Footer />
</template>

<style lang="scss">
@use "../scss/variables" as v;

body {
  margin: 0;
  font-family: Helvetica, Arial, sans-serif;
  background-color: v.$bg-colour;
  color: v.$text-colour;
}
</style>

<style lang="scss" scoped>
div {
  display: grid;
  grid-template-columns: 1fr 6fr;
}

@media (max-width: 700px) {
  div {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
}
</style>
