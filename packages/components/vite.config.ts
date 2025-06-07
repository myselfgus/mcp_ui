import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts'; // For generating type definitions

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MCPUIComponents',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: ['react', 'react-dom'], // Add other peer deps
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
  },
  plugins: [dts({ insertTypesEntry: true })],
});
