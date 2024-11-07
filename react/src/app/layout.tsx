/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import type { Metadata } from "next";
import type React from "react";
import Navbar from "@/lib/Navbar.tsx";
import Footer from "@/lib/Footer.tsx";
import styles from "./layout.module.scss";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Countdown Timers",
  description: "Watch timers count down",
  // metadataBase: process.env.BASE_PATH!,
  openGraph: {
    title: "Countdown Timers",
    type: "website",
    description: "Watch timers count down",
    url: "https://sby1ce.github.io/countdown-timers",
    // no updateTime...
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TOOD icons
  const base: string | undefined = process.env.BASE_PATH;
  if (base === undefined) {
    // TODO remove this
    throw new Error("No base path in env");
  }
  return (
    <html lang="en">
      <body>
        <div className={styles.div}>
          <Navbar />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
