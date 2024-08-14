<!-- 
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { useRoute, useRuntimeConfig } from "#app";

/** https://stackoverflow.com/a/55292366 */
function trimEnd(pathname: string): string {
  let end: number = pathname.length;
  while (end > 0 && pathname[end - 1] === "/") {
    --end;
  }
  const path: string = pathname.slice(0, end);
  return path.length !== 0 ? path : "/";
}

/** Hardcoding a path here because too much effort
 * TODO: write a test for this
 */
function getBase(pathname: string): string {
  const lastWordIndex = pathname.lastIndexOf("/vue");
  return trimEnd(
    lastWordIndex !== -1 ? pathname.slice(0, lastWordIndex) : pathname,
  );
}

function isBench(pathname: string): boolean {
  return pathname.lastIndexOf("/bench") !== -1;
}

interface SiblingProps {
  name: string;
  index: string;
  bench: string;
}

const base: string = getBase(useRuntimeConfig().public.base);
const bench: boolean = isBench(useRoute().path);

function getSibling(name: string, path: `/${string}`): SiblingProps {
  return {
    name,
    index: base + path,
    bench: base + path + "/bench",
  } satisfies SiblingProps;
}

const siblings: SiblingProps[] = [
  getSibling("React", "/react"),
  getSibling("Solid", "/solid"),
  getSibling("Svelte", "/svelte"),
];
</script>

<template>
  <nav>
    <ul>
      <li>
        <details open>
          <summary>Vue</summary>
          <ul>
            <li :class="{ current: !bench }">
              <a :href="base">Timers</a>
            </li>
            <li :class="{ current: bench }">
              <a :href="base + '/bench'">Benchmark</a>
            </li>
          </ul>
        </details>
      </li>
      <li v-for="sibling in siblings" :key="sibling.index">
        <details>
          <summary>{{ sibling.name }}</summary>
          <ul>
            <li>
              <a :href="sibling.index">Timers</a>
            </li>
            <li>
              <a :href="sibling.bench">Benchmark</a>
            </li>
          </ul>
        </details>
      </li>
      <li><a :href="base + '/bench'">Benchmark</a></li>
      <li><a :href="base + '/legal'">Licences</a></li>
    </ul>
  </nav>
</template>

<style lang="scss" module>
@use "../scss/variables" as v;

@mixin gap($pad-left) {
  padding: 1rem 0 1rem $pad-left;
}

nav {
  padding-top: 4rem;
  padding-left: 20%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  scrollbar-color: v.$text-colour v.$bg-colour;
}

@media (max-width: 1000px) {
  nav {
    padding-left: 5%;
  }
}

@media (max-width: 700px) {
  nav {
    display: none;
  }
}

ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  position: relative;
  box-sizing: border-box;
  min-height: min-content;
}

.current {
  background-color: rgba(v.$secondary-bg-colour, 0.5);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0.5ex;
    background-color: v.$primary-colour;
  }
}

details {
  cursor: pointer;

  &[open] {
    margin-bottom: 0;
  }

  a {
    display: inline-block;
    padding-left: 4ex;
  }
}

summary {
  @include gap(0);
  font-weight: bold;
}

a {
  display: inline-block;
  @include gap(2ex);
  color: v.$text-colour;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:visited {
    color: v.$primary-colour;
  }
}
</style>
