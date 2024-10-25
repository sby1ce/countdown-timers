<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  let { height = "100%" }: { height?: string } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {height} viewBox="0 0 24 24">
  <circle cx="12" cy="4" r="3" />
  <circle cx="12" cy="12" r="3" />
  <circle cx="12" cy="20" r="3" />
</svg>

<style lang="scss">
  @use "variables" as v;

  svg {
    fill: v.$text-colour;
  }
</style>
