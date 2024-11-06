/*
Copyright 2024 sby1ce

SPDX-License-Identifier: CC0-1.0
*/

const PARENT_PATH = "/countdown-timers";
const BASE_PATH = PARENT_PATH + "/react";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  env: {
    PARENT_PATH,
    BASE_PATH,
  },
  output: "export",
  reactStrictMode: true,
  basePath: BASE_PATH,
  sassOptions: {
    // Crutch for now https://github.com/vercel/next.js/issues/71638
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
