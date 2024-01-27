// vite.config.js
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

export default defineConfig({
    plugins: [eslint()],
    root: "./",
    base: "/",
    build: {
        outDir: "../server/public",
        assetsDir: "assets",
        sourcemap: true,
    },
    server: {
        host: "localhost",
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5000/",
                changeOrigin: true,
            },
        },
    },
});
