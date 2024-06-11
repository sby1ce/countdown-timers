<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let timerNameInput: HTMLInputElement;
  let timerDateInput: HTMLInputElement;

  const dispatch = createEventDispatcher();

  function addTimer() {
    const shouldContinue: boolean = dispatch(
      "click",
      {
        timerName: timerNameInput.value,
        timerDate: timerDateInput.value,
      },
      { cancelable: true },
    );

    if (shouldContinue) {
      timerNameInput.value = "";
      timerDateInput.value = "";
    }
  }
</script>

<div class="outer">
  <div class="inner">
    <label for="addName" hidden>Add timer name</label>
    <input bind:this={timerNameInput} id="addName" type="text" placeholder="Timer name here" />

    <label for="addTime" hidden>Choose time</label>
    <input bind:this={timerDateInput} id="addTime" type="datetime-local" step="0.01" />
  </div>

  <button type="button" on:click={addTimer}> Add timer </button>
</div>

<style lang="scss">
  @use "$lib/variables" as v;

  button {
    font-family: inherit;
    background-color: v.$bg-colour;
    color: v.$text-colour;
  }

  div {
    display: flex;
  }

  .outer {
    flex-direction: row;
    margin: 2em;
  }

  .inner {
    flex-direction: column;
  }
</style>
