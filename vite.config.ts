import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [
    glsl({
      include: ["**/*.glsl", "**/*.vert", "**/*.frag", "**/*.vs", "**/*.fs"],
      compress: false, // Keep shaders readable for learning
      watch: true, // Enable hot reload for shaders
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },
});
