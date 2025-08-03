import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Read package.json to get version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.APP_NAME': JSON.stringify(process.env.npm_package_name),
      // Add global constant to fix Buffer is not defined error
      global: 'globalThis',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        // Add polyfills for Node.js modules
        'stream': 'stream-browserify',
        'util': 'util',
        'buffer': 'buffer',
        'crypto': 'crypto-browserify',
        'http': 'stream-http',
        'https': 'https-browserify',
        'os': 'os-browserify/browser',
        'path': 'path-browserify',
        'zlib': 'browserify-zlib',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      port: 3000,
      open: true,
      // Enable CORS for development
      cors: true,
      // Set up proxy for API requests if needed
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // Your backend server
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            wagmi: ['wagmi', 'viem', '@wagmi/core', '@wagmi/connectors'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
            utils: ['date-fns', 'lodash', 'ethers'],
          },
        },
      },
      // Fix for commonjs dependencies
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
