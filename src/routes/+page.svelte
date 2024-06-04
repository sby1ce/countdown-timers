<script>
  import TimerBlock from "./TimerBlock.svelte";
  import Footer from "./Footer.svelte";
</script>

<h1>Watch countdowns</h1>

<TimerBlock />
<br />
<Footer />

<style>
  :global(body) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: Helvetica, Arial, sans-serif;
    background-color: #111111;
    color: #eeeeee;
  }
</style>
