interface ITimer {
  key: string;
  name: string;
  origin: number;
  timerStrings: string[];
}

export function loadFromLocalStorage(): ITimer[] {
  const temp = [
    {
      key: "Timer 0",
      name: "Timer 0 name",
      origin: 0,
      timerStrings: ["0d 0h 0m 0s", "0s", "0h"],
    },
    {
      key: "Timer 1",
      name: "Timer 1 here",
      origin: 1696174196000,
      timerStrings: ["1d 1h 1m 1s", "1s", "1h"],
    },
    {
      key: "Timer 2",
      name: "IYKYK",
      origin: 1607025600000,
      timerStrings: [],
    },
  ];
  if (
    !storageAvailable("localStorage") ||
    localStorage?.getItem("timers") === undefined ||
    localStorage.getItem("timers") === null ||
    localStorage.getItem("timers") === "{}"
  ) {
    if (storageAvailable("localStorage")) {
      localStorage.setItem("timers", "{}");
    }
    return temp;
  }
  // getItem theoretically never returns null but TS doesn't know
  //@ts-expect-error
  return JSON.parse(localStorage.getItem("timers"));
}

export function storageAvailable(type: string) {
  let storage;
  try {
    // I don't even know what it wants from me here
    //@ts-expect-error
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}
