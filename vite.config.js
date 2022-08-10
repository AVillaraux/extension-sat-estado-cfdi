import { defineConfig } from 'vite'
import { resolve } from 'path'
import copy from 'rollup-plugin-copy'

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
                },
                plugins: [
                    copy({
                        targets: [
                            {
                                src: 'src/manifest.json',
                                dest: resolve(__dirname, './dist')
                            },
                            {
                                src: 'src/images',
                                dest: resolve(__dirname, './dist')
                            }
                        ],
                        verbose: true
                    })
                ]
            }
        }
    }
})
