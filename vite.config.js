import { defineConfig } from "vite"
import { themeDevServer } from "./theme-dev-server"

export default defineConfig({
  plugins: [themeDevServer()]
})
