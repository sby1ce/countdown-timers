<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts" context="module">
  export enum ButtonStyle {
    Bg,
    SecondaryBg,
    Primary,
    Text,
  }
</script>

<script lang="ts">
  export let style: ButtonStyle = ButtonStyle.Bg;
  let class_: string = "style-bg";
  $: switch (style) {
    case ButtonStyle.Bg:
      class_ = "style-bg";
      break;
    case ButtonStyle.SecondaryBg:
      class_ = "style-secondary-bg";
      break;
    case ButtonStyle.Primary:
      class_ = "style-primary";
      break;
    case ButtonStyle.Text:
      class_ = "style-text";
      break;
  }
</script>

<button on:click type="button" class={class_}>
  <slot />
</button>

<style lang="scss">
  @use "$lib/variables" as v;

  button {
    border: 0;
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: inherit;
    color: v.$text-colour;

    &.style-bg {
      background-color: v.$bg-colour;
    }
    &.style-secondary-bg {
      background-color: v.$secondary-bg-colour;
    }
    &.style-primary {
      background-color: v.$primary-colour;
    }
    &.style-text {
      background-color: v.$text-colour;
    }

    &:hover {
      box-shadow: 0 0 2em v.$primary-colour;
    }

    &:active {
      outline: solid v.$primary-colour;
    }
  }
</style>
