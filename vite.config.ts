import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({})
  ],
  build: {
    // Enables better console errors messages (name of React component error occured in) on built app
    minify: false
  },
  base: "./",
  server: {
    port: 8080
  },
  preview: {
    port: 8080,
  },
})


