import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import SSR from 'vite-ssr/plugin.js';

export default defineConfig (() => ({
    build: {
        target: 'es2015',
        outDir: 'dist'
    },
    plugins: [
        vue({
            include: [/\.vue$/, /\.md$/],
        }), 
        SSR()
    ]
}));