import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const src = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': src,
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    holdUntilCrawlEnd: true,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'next-themes',
      'react-router-dom',
      '@tanstack/react-query',
      'sonner',
      'radix-ui',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'cmdk',
      'lucide-react',
      'react-day-picker',
      'cookie',
      'zod',
    ],
    rolldownOptions: {
      plugins: [
        {
          name: 'uma-copia-de-react',
          renderChunk(code, chunk) {
            const fileName = chunk.fileName ?? ''
            const copiaDoReact =
              fileName.startsWith('react-') &&
              !fileName.startsWith('react-dom') &&
              code.includes('function resolveDispatcher')
            if (!copiaDoReact) return null
            return 'export { t } from "./react.js";\n'
          },
        },
      ],
    },
  },
})
