import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "/ChessOpeningExplorer/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Cache the bundled opening index separately from the app code.
        manualChunks(id) {
          if (id.includes("/src/data/openings.json")) return "opening-data";
        },
      },
    },
  },
});
