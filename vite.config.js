import { defineConfig, normalizePath } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(() => {
    return {
        root: resolve(__dirname, 'src'),
        build: {
            emptyOutDir: true,
            outDir: resolve(__dirname, './dist'),
            rollupOptions: {
                output: {
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: ({name}) => {
                        if (/\.css$/.test(name ?? '')) {
                            return 'assets/css/[name]-[hash][extname]';
                        }

                        return 'assets/[name]-[hash][extname]';
                    },
                }
            }
        },
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: normalizePath(resolve(__dirname, './src/manifest.json')),
                        dest: './'
                    },
                    {
                        src: normalizePath(resolve(__dirname, './src/images')),
                        dest: './'
                    }
                ],
                verbose: true
            })
        ]
    }
})
