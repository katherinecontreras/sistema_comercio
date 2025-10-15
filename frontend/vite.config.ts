import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🦀 Opciones específicas para desarrollo con Tauri
  clearScreen: false, // evita ocultar errores de Rust
  server: {
    port: 1420,        // puerto fijo que Tauri espera
    strictPort: true,  // falla si el puerto está ocupado
    watch: {
      ignored: ["**/src-tauri/**"], // evita recargar al cambiar código Rust
    },
  },
});

