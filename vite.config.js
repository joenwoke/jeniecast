import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        vault: resolve(__dirname, "vault.html"),
        add: resolve(__dirname, "add.html")
      }
    }
  }
});
