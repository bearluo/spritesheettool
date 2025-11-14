import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { cocosPanel, cocosPanelConfig } from '@cocos-fe/vite-plugin-cocos-panel'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cocosPanelConfig(),
    cocosPanel({
      autoReload: true,
      port: 8080,
      panelVersion: 3,
      transform: (css) => {
        // Transform Element Plus CSS for Cocos Creator panel
        return css.replace(/:root|html\.dark/g, (match) => {
          return match === ':root' ? ':host' : '#app.dark';
        });
      },
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: {
        browser: resolve(__dirname, 'src/browser/index.ts'),
        panel: resolve(__dirname, 'src/panels/panel.ts'),
      },
      formats: ['cjs'],
      fileName: (format, entryName) => `${entryName}.cjs`,
    },
    rollupOptions: {
      external: ['fs', 'path', 'electron', 'Editor'],
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
})