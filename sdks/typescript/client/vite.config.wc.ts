import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/components/UIResourceRendererWC.tsx'),
      name: 'McpUiClientWC',
      formats: ['es'],
      fileName: () => 'ui-resource-renderer.wc.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    sourcemap: false,
  },
});
