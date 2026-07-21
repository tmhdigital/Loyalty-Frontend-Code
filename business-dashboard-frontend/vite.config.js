import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { firebaseMessagingSwPlugin } from "./src/vite/plugins/firebaseMessagingSwPlugin.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), firebaseMessagingSwPlugin(env)],
    base: '/',
    server: {
      host: true, // 0.0.0.0 — localhost + LAN IP (e.g. 10.10.7.x) both work
      port: 3003,
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
});
