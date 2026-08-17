import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    outDir: 'share-dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
})
