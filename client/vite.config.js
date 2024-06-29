import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import jsconfigPaths from "vite-jsconfig-paths";

export default defineConfig({
  plugins: [react(), jsconfigPaths()],

  build: {
    rollupOptions: {
      external: ["@radix-ui/react-progress", "@radix-ui/react-popover", "cmdk"],
      output: {
        globals: {
          "@radix-ui/react-progress": "RadixProgress",
          "@radix-ui/react-popover": "RadixPopover",
          cmdk: "cmdk",
        },
      },
    },
  },
});
