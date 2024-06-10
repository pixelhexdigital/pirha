import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import jsconfigPaths from "vite-jsconfig-paths";

// Convert the import.meta.url to a file path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("dirname", __dirname);

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@/": path.resolve(__dirname, "src"),
//       "@/pages/": path.resolve(__dirname, "src/pages"),
//       "@/components/": path.resolve(__dirname, "src/components"),
//       "@/assets/": path.resolve(__dirname, "src/assets"),
//       "@/store/": path.resolve(__dirname, "src/store"),
//       "@/utils/": path.resolve(__dirname, "src/utils"),
//       "@/routes/": path.resolve(__dirname, "src/routes"),
//     },
//   },
// });

export default defineConfig({
  plugins: [react(), jsconfigPaths()],
});
