<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script>
  import TimerBlock from "./TimerBlock.svelte";
</script>

<div>
  <h1>Watch countdowns</h1>

  <TimerBlock />
</div>

<style lang="scss">
  div {
    display: grid;
    grid-template-rows: auto 1fr;
  }

  h1 {
    font-weight: normal;
    text-indent: 4ex;
  }

  @media (max-width: 400px) {
    h1 {
      text-indent: 0;
      text-align: center;
    }
  }
</style>
