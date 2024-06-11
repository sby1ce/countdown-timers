<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script>
  import TimerBlock from "./TimerBlock.svelte";
</script>


<main>
  <h1>Watch countdowns</h1>
  
  <TimerBlock />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  h1 {
    font-weight: normal;
  }
</style>
