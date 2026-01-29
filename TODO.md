# TODO - Graphics Playground

This document tracks planned enhancements and future work for the graphics playground.

## High Priority

### More Shader Examples

- [ ] **Checkerboard Pattern** - Introduce step functions and pattern generation
- [x] ~~**Circle/Distance Fields**~~ - Completed as CirclePattern example
- [ ] **Simple Noise** - Basic procedural noise patterns
- [x] ~~**3D Rotating Cube**~~ - Completed as RotatingCube example
- [ ] **Basic Lighting (Phong)** - Introduce lighting calculations in 3D

### UI Control Panel

- [x] ~~Create `ControlPanel.ts` component for uniform controls~~
- [x] ~~Implement view mode controls (shaded/wireframe)~~
- [x] ~~Implement time controls (speed multiplier, pause/resume, reset)~~
- [x] ~~Auto-generate controls based on example's uniform definitions~~
- [x] ~~Settings persist across example switches~~
- [ ] Implement slider controls for numeric uniforms (framework ready)
- [ ] Implement color picker for vec3 color uniforms
- [ ] Implement toggle switches for boolean uniforms
- [ ] Add reset all settings to defaults button

## Medium Priority

### Live Shader Editor

- [ ] Integrate Monaco Editor or CodeMirror
- [ ] Syntax highlighting for GLSL
- [ ] Display shader compilation errors inline
- [ ] Toggle between preset examples and custom shader editing
- [ ] Save/load custom shaders to localStorage
- [ ] Fork/duplicate existing examples for modification

### Additional Examples

- [ ] **Animated Noise** - Combine noise with time
- [ ] **Fractals** - Mandelbrot or Julia set
- [ ] **Ray Marching Sphere** - 3D without geometry
- [ ] **Vertex Animation** - More complex vertex displacement
- [ ] **Post-Processing Effect** - Screen-space shader
- [ ] **Particle System** - Point sprites with shaders
- [ ] **Normal Mapping** - Advanced 3D technique
- [ ] **Reflection/Refraction** - Environment mapping

### Educational Features

- [ ] Add "View Source" button to show shader code
- [ ] Inline tooltips explaining GLSL functions
- [ ] Interactive tutorials/walkthroughs
- [ ] "Challenge" mode with tasks to complete
- [ ] Diff viewer to compare shader variations
- [ ] Annotated shader code with expandable explanations

## Low Priority

### Export/Share Features

- [ ] Screenshot capture functionality
- [ ] Record video/GIF of animated shaders
- [ ] Export shader code as standalone HTML file
- [ ] Generate shareable URLs (requires backend/URL encoding)
- [ ] Social sharing (Twitter, etc.)

### Developer Experience

- [ ] Add ESLint for code quality
- [ ] Add Prettier for consistent formatting
- [ ] Create example generator CLI tool
- [ ] Unit tests for core components
- [ ] Visual regression testing for shader outputs
- [ ] Hot reload for TypeScript changes in examples

### Performance & Quality

- [ ] Add performance profiler for shader complexity
- [ ] Warn when shader exceeds performance budget
- [ ] Add quality presets (low/medium/high segments)
- [ ] Implement adaptive quality based on FPS
- [ ] Add WebGPU support as alternative renderer
- [ ] Optimize bundle size with code splitting

### UI/UX Enhancements

- [ ] Mobile-responsive layout
- [ ] Touch controls for 3D examples on mobile
- [ ] Keyboard shortcuts for common actions
- [ ] Dark/light theme toggle
- [ ] Fullscreen mode for canvas
- [ ] Resizable panels (sidebar, code editor)
- [ ] Example categories/tags for better organization
- [ ] Search/filter examples
- [ ] Favorites system

## Future Ideas

### Advanced Features

- [ ] Multi-pass rendering (render to texture)
- [ ] Shader includes/modules system for code reuse
- [ ] Compute shaders (requires WebGPU)
- [ ] Texture input support (upload images)
- [ ] Audio-reactive shaders (microphone/audio file input)
- [ ] VR/AR shader experiences

### Community Features

- [ ] User accounts and authentication
- [ ] Gallery of user-created shaders
- [ ] Comments and ratings on examples
- [ ] Fork/remix other users' shaders
- [ ] Collaborative real-time editing
- [ ] Shader challenges/competitions

### Documentation

- [ ] Video tutorials for each example
- [ ] GLSL function reference integrated in UI
- [ ] Beginner's guide to shader programming
- [ ] Advanced techniques guide
- [ ] Blog posts on shader techniques
- [ ] API documentation for extending the playground

## Completed

- [x] Project setup with Vite, TypeScript, Three.js
- [x] Core engine (Scene, Renderer, Camera, Controls)
- [x] Example system architecture
- [x] Shader hot reload with vite-plugin-glsl
- [x] Basic Gradient example (2D)
- [x] Animated Wave example (2D)
- [x] Circle Pattern example (2D) - Distance fields and smoothstep
- [x] Rotating Colors example (2D) - Radial patterns and color animation
- [x] Rotating Cube example (3D) - First 3D example with position-based colors
- [x] Pulsing Sphere example (3D) - Vertex displacement and lighting
- [x] Example selector UI
- [x] FPS counter
- [x] Documentation (README.md, CLAUDE.md)
- [x] UI Control Panel with lil-gui library
- [x] View mode controls (shaded/wireframe rendering)
- [x] Time controls (speed, pause/resume, reset)
- [x] Auto-generated example-specific controls
- [x] Control metadata type system (src/types/controls.d.ts)
- [x] Settings persistence across example switches
- [x] Fixed 2D examples to properly fill viewport on window resize using fixed 2x2 geometry
- [x] GitHub Pages deployment with automated CI/CD workflow

---

## Notes

- Prioritize examples that teach fundamental concepts over complex effects
- Keep beginner-friendliness as the primary goal
- All new examples should follow the established pattern (constructor, update, dispose)
- Maintain comprehensive code comments for educational value
- Test shader hot reload with each new example
