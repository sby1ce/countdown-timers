import { defineConfig } from "@solidjs/start/config";

if (!process.env.VITE_PATH) {
  throw new Error(`${typeof process.env.VITE_PATH} ${process.env.VITE_PATH}`)
}

export default defineConfig({
  ssr: true,
  server: {
    preset: "static",
    baseURL: process.env.VITE_PATH,
  },
});
