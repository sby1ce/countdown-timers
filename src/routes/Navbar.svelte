<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";

  enum Current {
    Not,
    Base,
    Bench,
  }

  interface Sibling {
    url: `/${string}`;
    bench: `/${string}/${string}` | "/bench";
    text: string;
    current: Current;
  }

  let pathname: string = $page.url.pathname;
  $: pathname = $page.url.pathname;

  function getSibling(
    pathname: string,
    url: Sibling["url"],
    bench: Sibling["bench"],
    text: string,
  ): Sibling {
    const current: Current =
      pathname === url ? Current.Base : pathname === bench ? Current.Bench : Current.Not;
    return {
      url,
      bench,
      text,
      current,
    } satisfies Sibling;
  }

  let siblings: Sibling[] = [getSibling(pathname, "/", "/bench", "Svelte")];
  $: siblings = [getSibling(pathname, "/", "/bench", "Svelte")];
</script>

<nav>
  <ul>
    {#each siblings as sibling}
      <li>
        <details open={sibling.current !== Current.Not}>
          <summary>{sibling.text}</summary>
          <ul>
            <li class:current={sibling.current === Current.Base}>
              <a href="{base}{sibling.url}">Timers</a>
            </li>
            <li class:current={sibling.current === Current.Bench}>
              <a href="{base}{sibling.bench}">Benchmark</a>
            </li>
          </ul>
        </details>
      </li>
    {/each}
    <li><a href="{base}/bench">Benchmark</a></li>
    <li><a href="{base}/legal">Licences</a></li>
  </ul>
</nav>

<style lang="scss">
  @use "$lib/variables" as v;

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
