<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let success: boolean = false;
  let failure: boolean = false;

  function matchState(state: string, real: boolean) {
    switch (state) {
      case "success":
        success = real;
        break;
      case "failure":
        failure = real;
        break;
    }
  }

  function colourElement(state: string) {
    if (!state) {
      return null;
    }

    matchState(state, true);
    setTimeout(() => {
      matchState(state, false);
    }, 3000);
  }

  function handleClick(e: Event) {
    e.preventDefault();

    try {
      dispatch("click");

      colourElement("success");
    } catch (error) {
      console.error(error);

      colourElement("failure");
    }
  }
</script>

<button type="button" on:click={handleClick} class:success class:failure>
  <slot />
</button>

<style>
  button {
    font-family: inherit;
    box-sizing: border-box;
    border-width: 0.5em;
    margin: 0px 0.5em 0px 0.5em;
    background-color: #222222;
    color: #dddddd;
  }

  .success {
    border-color: limegreen;
  }

  .failure {
    border-color: red;
  }
</style>
