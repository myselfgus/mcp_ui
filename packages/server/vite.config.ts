import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'McpUiServer',
      formats: ['es', 'umd', 'cjs'], // cjs for Node compatibility
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [], // Add any server-side specific externals if needed
      output: {
        globals: {}
      }
    },
    target: 'node18',
    sourcemap: true,
  },
});
