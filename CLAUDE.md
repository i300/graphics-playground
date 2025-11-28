# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A beginner-friendly web-based shader playground built with Three.js, TypeScript, and Vite. The project enables live experimentation with GLSL shaders through a hot-reloading development environment.

## Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000 with hot reload
npm run build    # Type-check and build for production
npm run preview  # Preview production build locally
npm run format   # Format code
```

## Agent Instructions

After every major feature you should:

- Update the TODO and README docs to reflect changes
- Run the formatter
- Commit the changes

## Core Architecture

### Application Lifecycle

The application follows a coordinated initialization pattern in `src/main.ts`:

1. **Core Components** (`src/core/`) - Initialized in sequence:
   - `Scene` - Three.js scene wrapper with dark background
   - `Renderer` - WebGL renderer attached to canvas
   - `Camera` - Dual-mode camera (perspective for 3D, orthographic for 2D)
   - `Controls` - OrbitControls wrapper (enabled/disabled per example)

2. **Example System** - Registry-based architecture:
   - `src/examples/index.ts` exports `exampleList` array with all examples
   - Each example is a class with `constructor(scene, renderer)`, `update(time)`, and `dispose()` methods
   - The `App` class instantiates examples dynamically and cleans up previous instances

3. **Render Loop** - Single requestAnimationFrame loop:
   - Updates controls if enabled
   - Calls `currentExample.update(elapsedTime)` with time in seconds
   - Renders scene with current camera
   - Updates FPS counter

### Camera Switching

The app dynamically switches camera modes based on `ExampleConfig.is3D`:

- **2D examples** (is3D: false): Use orthographic camera in -1 to 1 space, disable controls
- **3D examples** (is3D: true): Use perspective camera with OrbitControls enabled

This happens in `App.loadExample()` after instantiating the new example.

The camera's `updateAspect()` method is called on every window resize, automatically adjusting the orthographic frustum to maintain proper aspect ratio. All 2D examples implement a `resize()` method that the App class calls to update their geometry dimensions, ensuring they always fill the viewport. Examples can also use this to update uniforms or other state that depends on window size.

### Shader Hot Reload

Powered by `vite-plugin-glsl` configuration in `vite.config.ts`:

- `.glsl`, `.vert`, `.frag` files imported as strings
- `compress: false` keeps shaders readable
- `watch: true` enables HMR for shader files
- Modifying a shader triggers Vite HMR, updating the ShaderMaterial instantly

## Creating New Examples

Each example follows a strict interface pattern:

```typescript
export class ExampleName {
  public mesh: THREE.Mesh;
  private renderer: THREE.WebGLRenderer;
  private uniforms: any; // Optional, for animated examples

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    // Setup uniforms if needed
    this.uniforms = { uTime: { value: 0 } };

    // Create ShaderMaterial
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    });

    // Calculate aspect-adjusted dimensions for 2D examples
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;
    const geometry = new THREE.PlaneGeometry(width, height, 32, 32);

    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update(time: number) {
    // Update uniforms if animated
    if (this.uniforms.uTime) {
      this.uniforms.uTime.value = time;
    }
  }

  resize() {
    // REQUIRED for 2D examples: Update geometry on window resize
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;

    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(width, height, 32, 32);
  }

  dispose() {
    // REQUIRED: Clean up resources
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
```

**Registration** - Add to `src/examples/index.ts`:

```typescript
{
  id: 'unique-id',           // Used in URL/UI
  name: 'Display Name',
  description: 'What this teaches',
  Example: ClassName,        // Class constructor
  is3D: false               // Controls camera/controls mode
}
```

## Advanced Examples & Multi-Pass Rendering

### Constructor Signature Update

As of the Physarum example, all examples now receive both `scene` and `renderer` parameters:

```typescript
constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer)
```

**Why?** Advanced techniques like multi-pass rendering, post-processing, and render-to-texture require direct access to the WebGLRenderer to call `renderer.setRenderTarget()`. This change makes the renderer available to all examples for future extensibility.

**For simple examples**: The renderer parameter can be stored but doesn't need to be used. Most examples will continue to work with just the scene.

### Multi-Pass Rendering Pattern

The Physarum example introduces multi-pass rendering, where multiple render passes feed into each other:

**Key Concepts**:

1. **WebGLRenderTarget**: Render to texture instead of the screen
2. **Ping-pong buffers**: Two render targets that swap roles each frame (read ↔ write)
3. **Feedback loops**: Output from frame N becomes input for frame N+1

**Example structure**:

```typescript
export class AdvancedExample {
  private renderer: THREE.WebGLRenderer;
  private renderTargetA: THREE.WebGLRenderTarget;
  private renderTargetB: THREE.WebGLRenderTarget;
  private readTarget: THREE.WebGLRenderTarget;
  private writeTarget: THREE.WebGLRenderTarget;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;

    // Create render targets for ping-pong
    this.renderTargetA = new THREE.WebGLRenderTarget(size, size, options);
    this.renderTargetB = new THREE.WebGLRenderTarget(size, size, options);
    this.readTarget = this.renderTargetA;
    this.writeTarget = this.renderTargetB;
  }

  update(time: number) {
    // Pass 1: Render to texture
    this.renderer.setRenderTarget(this.writeTarget);
    this.material.uniforms.uPreviousFrame.value = this.readTarget.texture;
    this.renderer.render(this.scene1, this.camera);

    // Pass 2: Render to screen
    this.renderer.setRenderTarget(null);
    this.displayMaterial.uniforms.uTexture.value = this.writeTarget.texture;
    this.renderer.render(this.scene2, this.camera);

    // Swap buffers
    [this.readTarget, this.writeTarget] = [this.writeTarget, this.readTarget];
  }

  dispose() {
    this.renderTargetA.dispose();
    this.renderTargetB.dispose();
    // ... dispose other resources
  }
}
```

**Important notes**:

- Always reset render target to `null` before final display pass
- Dispose of all render targets in `dispose()` method
- Use `NearestFilter` for data textures, `LinearFilter` for visual textures
- Consider using `THREE.FloatType` for high-precision data

### GPU-Based Particle Systems

The Physarum example demonstrates GPU particle systems using DataTexture:

**Pattern**:

1. Store particle data in a texture (e.g., 1024×1024 = 1M particles)
2. Update particle positions using fragment shaders (GPU parallel processing)
3. Read particle data in vertex shaders to position geometry

**Benefits**:

- Millions of particles updated in parallel on GPU
- No CPU ↔ GPU data transfer bottleneck
- Feedback loops create emergent behavior

**See**: `src/examples/Physarum/` for complete implementation

## Key Implementation Details

### Geometry for 2D Shaders

2D shader examples use aspect-ratio-adjusted PlaneGeometry to fill the viewport. Calculate dimensions based on the canvas aspect ratio:

```typescript
const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
const aspect = canvas.clientWidth / canvas.clientHeight;
const width = aspect > 1 ? aspect * 2 : 2;
const height = aspect > 1 ? 2 : (1 / aspect) * 2;
const geometry = new THREE.PlaneGeometry(width, height);
```

**Why aspect-adjusted?** The orthographic camera uses bounds of -1 to 1 vertically, and aspect-adjusted bounds horizontally (e.g., -1.78 to 1.78 for a 16:9 aspect). Matching the plane dimensions to these bounds ensures fullscreen coverage.

**For vertex displacement**, add segments: `PlaneGeometry(width, height, 32, 32)`.

**Responsive Resizing**: All 2D examples implement a `resize()` method to update geometry dimensions when the window resizes. This ensures the plane always fills the viewport. See any 2D example for the pattern.

### Uniform Updates

Uniforms must follow Three.js format: `{ uniformName: { value: initialValue } }`. Update via `this.uniforms.uniformName.value = newValue` in the `update()` method.

### Time-Based Animation

The `update(time)` method receives elapsed seconds since app start. Use this for smooth animation: `uTime + someValue` creates continuous motion regardless of frame rate.

### Resource Cleanup

The `dispose()` method is **critical**. Always dispose of geometry and material when switching examples to prevent memory leaks. The pattern is:

```typescript
this.mesh.geometry.dispose();
(this.mesh.material as THREE.Material).dispose();
```

## TypeScript Configuration

GLSL modules are typed via `src/types/glsl.d.ts`. Import shaders as:

```typescript
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
```

TypeScript treats these as strings at compile time; Vite transforms them at build time.

## Common Patterns

### Passing Data Between Shaders

Vertex shader defines varying:

```glsl
varying vec2 vUv;
void main() {
  vUv = uv;
  // ... rest
}
```

Fragment shader receives it:

```glsl
varying vec2 vUv;
void main() {
  // Use vUv.x, vUv.y
}
```

### Commenting for Beginners

All shader code should include explanatory comments about:

- What each line does (for first examples)
- Why certain values are chosen
- Expected ranges (e.g., "vUv.x goes from 0 to 1")
- GLSL function purposes

This is an educational project, so over-commenting is preferred.
