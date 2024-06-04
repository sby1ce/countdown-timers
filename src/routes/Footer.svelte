<script lang="ts">
  import FooterButton from "./FooterButton.svelte";

  function deleteLocalStorage() {
    if (localStorage.length) {
      localStorage.clear();
      console.log("Cleared localStorage");
    } else {
      console.log("localStorage already clear");
    }
  }
</script>

<footer>
  <FooterButton on:click={deleteLocalStorage}>Delete localStorage</FooterButton>
</footer>

<style>
  footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
</style>
