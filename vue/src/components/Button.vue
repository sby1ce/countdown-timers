<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { ButtonStyle } from "~/utils.ts";

interface ButtonEmits {
  (e: "click"): void;
}

interface ButtonProps {
  color?: ButtonStyle;
}

defineEmits<ButtonEmits>();
const props = withDefaults(defineProps<ButtonProps>(), {
  color: ButtonStyle.Bg,
});

function matchStyle(style: ButtonStyle): string {
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

const class_ = matchStyle(props.color);
</script>

<template>
  <button type="button" :class="[class_]" @click="$emit('click')">
    <slot />
  </button>
</template>

<style lang="scss" module>
@use "../scss/variables" as v;

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
