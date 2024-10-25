<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts" module>
  export const enum ButtonStyle {
    Bg,
    SecondaryBg,
    Primary,
    Text,
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    style = ButtonStyle.Bg,
    onclick,
    children,
  }: {
    style?: ButtonStyle;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  } = $props();

  function match(style: ButtonStyle): string {
    switch (style) {
      case ButtonStyle.Bg:
        return "style-bg";
      case ButtonStyle.SecondaryBg:
        return "style-secondary-bg";
      case ButtonStyle.Primary:
        return "style-primary";
      case ButtonStyle.Text:
        return "style-text";
    }
  }

  const class_: string = $derived(match(style));
</script>

<button {onclick} type="button" class={class_}>
  {@render children?.()}
</button>

<style lang="scss">
  @use "variables" as v;

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
