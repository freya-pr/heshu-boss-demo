import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  define: {
    'import.meta.env.VITE_SHARE_MODE': JSON.stringify('true')
  },
  plugins: [vue()],
  build: {
    outDir: 'share-dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
})
