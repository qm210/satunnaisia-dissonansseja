// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
 root: './src',
 base: '/',
 build: {
    outDir: "../server/public",
    assetsDir: 'assets',
    sourcemap: true,
 },
 server: {
    host: 'localhost',
    port: 5173,
    proxy: "http://localhost:5000/"
 },
});
