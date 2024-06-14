<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { base } from "$app/paths";
  import Footer from "./Footer.svelte";
</script>

<svelte:head>
  <link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16x16.png" />
  <link rel="manifest" href="{base}/site.webmanifest" />
  <link rel="mask-icon" href="{base}/safari-pinned-tab.svg" color="#5bbad5" />
  <link rel="shortcut icon" href="{base}/favicon.ico" />
  <meta name="apple-mobile-web-app-title" content="Countdown Timers" />
  <meta name="application-name" content="Countdown Timers" />
  <meta name="msapplication-TileColor" content="#000000" />
  <meta name="msapplication-config" content="{base}/browserconfig.xml" />
  <meta name="theme-color" content="#ffffff" />

  <title>Countdown Timers</title>
  <meta name="description" content="Watch timers count down" />
  <meta property="og:title" content="Countdown Timers" />
  <meta property="og:type" content="website" />
  <meta property="og:description" content="Watch timers count down" />
  <meta property="og:url" content="https://sby1ce.github.io/countdown-timers" />
  <meta property="og:updated_time" content="2024-06-09" />
</svelte:head>

<slot />

<Footer />

<style lang="scss">
  @use "$lib/variables" as v;

  :global(body) {
    margin: 0;
    font-family: Helvetica, Arial, sans-serif;
    background-color: v.$bg-colour;
    color: v.$text-colour;
  }
</style>
