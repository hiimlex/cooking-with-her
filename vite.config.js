var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'node:path';
import fs from 'node:fs';
function pwaPlugin() {
    return {
        name: 'pwa-sw-version',
        apply: 'build',
        closeBundle: function () {
            var swSrc = path.resolve(__dirname, 'public/sw.js');
            var swDest = path.resolve(__dirname, 'dist/sw.js');
            if (!fs.existsSync(swSrc))
                return;
            var version = "cwh-".concat(Date.now());
            var content = fs.readFileSync(swSrc, 'utf-8').replace(/const CACHE_NAME = 'cwh-v1'/, "const CACHE_NAME = '".concat(version, "'"));
            fs.writeFileSync(swDest, content);
        },
    };
}
export default defineConfig({
    // VITE_BASE_PATH is injected by the GH Pages CI workflow.
    // Locally and in Docker it stays '/' (the default).
    base: (_a = process.env.VITE_BASE_PATH) !== null && _a !== void 0 ? _a : '/',
    plugins: [react(), pwaPlugin()],
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, './shared'),
        },
    },
});
