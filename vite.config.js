import { defineConfig } from "vite"
import { themeDevServer } from "./theme-dev-server"

export default defineConfig({
  plugins: [themeDevServer()],
  build: {
    minify: true,
    cssCodeSplit: true,
    outDir: 'static',
    lib: {
      entry: [
        'src/index.js',
        'src/index.css',
        'src/content.css',
      ],
      formats: ['es'],
      fileName: (_, name) => `${name}.js`,
    }
  }
})
