import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React-related libraries
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-avatar'
          ],
          
          // Animation libraries
          'animation-vendor': ['framer-motion'],
          
          // Chart libraries
          'chart-vendor': ['recharts'],
          
          // Utility libraries
          'utils-vendor': [
            'lucide-react',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'zustand'
          ]
        }
      }
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Enable minification
    minify: 'esbuild',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'zustand'
    ]
  },
})

