<script lang="ts">
  import { onMount } from "svelte";
  import { timers, newTimers } from "./timers.ts";
  import { storageAvailable } from "./storage.ts";
  import Timer from "./Timer.svelte";
  import AddTimer from "./AddTimer.svelte";
  import init from "../../countdown-rs/pkg/countdown_rs_bg.wasm?init";

  let updateTimers: CallableFunction = newTimers;

  function initialize() {
    init().then((instance) => {
      // updateTimers = instance.exports.update_timers as CallableFunction;
      console.log(instance.exports.add(3, 4));
      // console.log(instance.exports.update_timers($timers, formats));
    });
  }

  onMount(initialize);

  function hashTimerName(timerName: string) {
    return `timer${Array.from(timerName).reduce(
      (hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
      0,
    )}`;
  }

  function dateStringToUnix(dateString: string) {
    try {
      const temp = new Date(dateString);

      return Date.UTC(
        temp.getUTCFullYear(),
        temp.getUTCMonth(),
        temp.getUTCDate(),
        temp.getUTCHours(),
        temp.getUTCMinutes(),
        temp.getUTCSeconds(),
        temp.getUTCMilliseconds(),
      );
    } catch {
      return null;
    }
  }

  interface DispatchedEvent extends Event {
    detail: { timerName: string; timerDate: string };
  }

  function addTimerEvent(event: DispatchedEvent) {
    const newOrigin = dateStringToUnix(event.detail.timerDate);

    if (typeof newOrigin !== "number" || Number.isNaN(newOrigin)) {
      event.preventDefault();
      return null;
    }

    const innerName = hashTimerName(event.detail.timerName);

    for (const timer of $timers) {
      if (timer.key === innerName) {
        event.preventDefault();
        return null;
      }
    }

    const newTimer = {
      key: innerName,
      name: event.detail.timerName,
      origin: newOrigin,
      timerStrings: ["0d 0h 0m 0s", "0s", "0h"],
    };

    timers.update((t) => [...t, newTimer]);

    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", JSON.stringify($timers));
    }
  }

  let formats = [
    {
      day: true,
      hour: true,
      minute: true,
      second: true,
    },
    {
      second: true,
    },
    {
      hour: true,
    },
  ];

  timers.update((t) => updateTimers(t, formats));
  setInterval(() => {
    timers.update((t) => updateTimers(t, formats));
  }, 1000);
</script>

{#each $timers as timer, position (timer.key)}
  <Timer {position} />
{/each}

<AddTimer on:click={addTimerEvent} />
