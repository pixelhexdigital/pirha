import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import jsconfigPaths from "vite-jsconfig-paths";

// Convert the import.meta.url to a file path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("dirname", __dirname);

export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
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
