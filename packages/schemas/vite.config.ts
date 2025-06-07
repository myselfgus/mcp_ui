import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts'; // For generating type definitions

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MCPUISchemas',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
  },
  plugins: [dts({ insertTypesEntry: true })],
});
