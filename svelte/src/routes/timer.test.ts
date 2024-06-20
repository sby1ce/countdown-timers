/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { render, screen } from "@testing-library/svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import Timer from "./Timer.svelte";

interface TimerProps {
  pop: () => void;
  name: string;
  countdowns: string[];
}

function mockProps(): TimerProps {
  return {
    pop: vi.fn(),
    name: "Test timer",
    countdowns: [],
  } satisfies TimerProps;
}

test("name renders", () => {
  const props = mockProps();
  render(Timer, props);

  const button = screen.getByRole("button", { hidden: true, name: "Delete timer" });
  const greeting = screen.queryByText(/hello/iu);

  expect(button).toBeInTheDocument();
  expect(greeting).not.toBeInTheDocument();
});

test("settings become visible on click", async () => {
  const user: UserEvent = userEvent.setup();
  const props = mockProps();
  render(Timer, props);

  const button: HTMLButtonElement = screen.getByRole("button", { hidden: false, name: "" });
  await user.click(button);
  const settings = screen.getByRole("button", { name: "Delete timer", hidden: false });

  expect(settings).toBeInTheDocument();
});
