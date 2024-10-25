<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  let { pkg, licence }: { pkg: string; licence: string } = $props();
</script>

<details>
  <summary>{pkg}</summary>
  <p>{licence}</p>
</details>
