/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { JSX, MouseEvent as ReactMouseEvent } from "react";
import styles from "./Button.module.scss";
import clsx from "clsx";
import type React from "react";

export const enum ButtonStyle {
  Bg,
  SecondaryBg,
  Primary,
  Text,
}

export interface ButtonProps {
  click: (event: ReactMouseEvent) => void;
  children: React.ReactNode;
  bg: ButtonStyle;
}

function switchStyle(bg: ButtonStyle): string {
  switch (bg) {
    case ButtonStyle.Bg:
      return styles["style-bg"];
    case ButtonStyle.SecondaryBg:
      return styles["style-secondary-bg"];
    case ButtonStyle.Primary:
      return styles["style-primary"];
    case ButtonStyle.Text:
      return styles["style-text"];
  }
}

export default function Button(props: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={(event) => props.click(event)}
      className={clsx(styles.button, switchStyle(props.bg))}
    >
      {props.children}
    </button>
  );
}
