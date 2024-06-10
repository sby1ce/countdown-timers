<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>{$page.status} {$page.error?.message}</h1>

<style lang="scss">
  h1 {
    font-family: inherit;
  }
</style>
