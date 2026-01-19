import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [dts({ rollupTypes: true })],
    publicDir: false,
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'BabylonMujoco',
            fileName: (format) => `babylon-mujoco.${format === 'es' ? 'mjs' : 'umd.cjs'}`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: ['@babylonjs/core'],
            output: {
                globals: {
                    '@babylonjs/core': 'BABYLON'
                }
            }
        }
    }
});
