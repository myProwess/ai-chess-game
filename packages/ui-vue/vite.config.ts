import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('Tres'),
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@chess/core': path.resolve(__dirname, '../core/src/index.ts'),
        },
    },
    base: '/vue/',
});
