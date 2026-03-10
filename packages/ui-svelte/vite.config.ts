import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            '@chess/core': path.resolve(__dirname, '../core/src/index.ts'),
        },
    },
    base: '/svelte/',
});
