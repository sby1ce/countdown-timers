<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import Footer from "~/components/Footer.vue";
import Navbar from "~/components/Navbar.vue";
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

<style lang="scss" module>
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
