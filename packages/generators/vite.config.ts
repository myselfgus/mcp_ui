import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts'; // For generating type definitions

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MCPUIFGenerators',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: [], // No peer deps for generators usually
      output: {
        globals: {}
      }
    },
    sourcemap: true,
  },
  plugins: [dts({ insertTypesEntry: true })],
});
