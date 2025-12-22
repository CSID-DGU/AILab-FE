import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 30081, // Set your desired port here
    host: true, // Allow external connections
    // open: true, // Automatically open browser
  },
});
