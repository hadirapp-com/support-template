import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-chrome-extension-files',
      writeBundle() {
        // Copy manifest.json
        if (existsSync('manifest.json')) {
          copyFileSync('manifest.json', 'dist/manifest.json')
        }
        
        // Copy icons directory
        if (existsSync('icons')) {
          if (!existsSync('dist/icons')) {
            mkdirSync('dist/icons', { recursive: true })
          }
          const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png']
          iconFiles.forEach(icon => {
            if (existsSync(`icons/${icon}`)) {
              copyFileSync(`icons/${icon}`, `dist/icons/${icon}`)
            }
          })
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    typecheck: {
      tsconfig: './tsconfig.test.json'
    }
  },
})
