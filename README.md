# Graphics Playground

A beginner-friendly web-based playground for learning 2D and 3D shaders using Three.js and WebGL.

## Features

- Live shader hot reload - see your changes instantly
- Well-commented example shaders
- Interactive examples with smooth animations
- Responsive window resizing - examples automatically adjust to fit viewport
- Modern development setup with Vite
- TypeScript for better code completion and learning

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or navigate to this directory

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

The application will automatically open in your default browser.

## Project Structure

```
graphics-playground/
├── src/
│   ├── main.ts              # Application entry point
│   ├── style.css            # Global styles
│   │
│   ├── core/                # Core Three.js wrapper classes
│   │   ├── Scene.ts         # Scene management
│   │   ├── Renderer.ts      # WebGL renderer
│   │   ├── Camera.ts        # Camera (2D/3D switching)
│   │   └── Controls.ts      # Orbit controls
│   │
│   ├── examples/            # Shader examples
│   │   ├── index.ts         # Examples registry
│   │   ├── BasicGradient/   # Example 1: Simple gradient
│   │   ├── CirclePattern/   # Example 2: Distance fields
│   │   ├── AnimatedWave/    # Example 3: Animated wave
│   │   ├── RotatingColors/  # Example 4: Radial patterns
│   │   ├── RotatingCube/    # Example 5: 3D cube
│   │   └── PulsingSphere/   # Example 6: 3D sphere
│   │
│   ├── ui/                  # UI components
│   │   └── ExampleSelector.ts
│   │
│   └── types/               # TypeScript declarations
│       └── glsl.d.ts        # GLSL module types
│
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Technology Stack

- **Three.js** - 3D graphics library that abstracts WebGL
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool with instant hot module replacement
- **vite-plugin-glsl** - Import GLSL shaders as modules with hot reload

## Available Examples

### 2D Examples

#### 1. Basic Gradient

A simple horizontal gradient shader that introduces:

- UV coordinates
- Color mixing with `mix()`
- Fragment shader basics

#### 2. Circle Pattern

A circle drawn with distance functions that teaches:

- Distance calculations with `distance()`
- Smooth edges with `smoothstep()`
- Anti-aliasing techniques
- Centering UV coordinates

#### 3. Animated Wave

An animated rippling wave effect that demonstrates:

- Uniforms (passing data from JavaScript to shaders)
- Vertex displacement
- Time-based animation
- Passing data between vertex and fragment shaders

#### 4. Rotating Colors

Spinning color patterns that show:

- Using `atan()` for radial/circular patterns
- Angle-based coloring
- Color animation with time
- Combining angles and distance for complex effects

### 3D Examples

#### 5. Rotating Cube

A colorful 3D cube that introduces:

- Creating 3D geometry (`BoxGeometry`)
- Using position data in shaders
- Working with normals for basic shading
- OrbitControls for 3D navigation
- Your first 3D shader!

#### 6. Pulsing Sphere

An animated 3D sphere that demonstrates:

- Vertex displacement for geometry animation
- Sphere geometry
- Simple lighting with dot product
- Combining vertex and fragment animations
- Time-based pulsing effects

## Creating a New Example

1. Create a new directory in `src/examples/`:

```bash
mkdir src/examples/MyExample
```

2. Create your shader files:

- `vertex.glsl` - Vertex shader
- `fragment.glsl` - Fragment shader
- `index.ts` - Example class

3. Example template for 2D (`index.ts`):

```typescript
import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export class MyExample {
  private mesh: THREE.Mesh;
  private uniforms: any;

  constructor(scene: THREE.Scene) {
    this.uniforms = {
      // Add your uniforms here
      uTime: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    });

    // For 2D examples: calculate aspect-adjusted dimensions
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;
    const geometry = new THREE.PlaneGeometry(width, height, 32, 32);

    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update(time: number) {
    // Update uniforms here
    this.uniforms.uTime.value = time;
  }

  resize() {
    // For 2D examples: update geometry on window resize
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;

    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(width, height, 32, 32);
  }

  dispose() {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
```

> **Note:** For 3D examples, you don't need the aspect-adjusted geometry or resize() method. Just use standard geometry like `BoxGeometry` or `SphereGeometry`.

4. Register your example in `src/examples/index.ts`:

```typescript
import { MyExample } from "./MyExample";

export const exampleList: ExampleConfig[] = [
  // ... existing examples
  {
    id: "my-example",
    name: "My Example",
    description: "Description of what this example teaches",
    Example: MyExample,
    is3D: false, // Set to true for 3D examples with camera controls
  },
];
```

## Shader Hot Reload

One of the best features of this playground is instant shader hot reload:

1. Start the dev server with `npm run dev`
2. Open any `.glsl` file in `src/examples/`
3. Make changes and save
4. See the changes instantly in your browser - no page refresh!

This makes shader development incredibly fast and fun.

## Learning Resources

### Shader Programming

- [The Book of Shaders](https://thebookofshaders.com/) - Interactive guide to GLSL
- [WebGL Fundamentals](https://webglfundamentals.org/) - Comprehensive WebGL tutorials
- [Shadertoy](https://www.shadertoy.com/) - Shader examples and inspiration

### Three.js

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js Journey](https://threejs-journey.com/) - Comprehensive Three.js course

### GLSL Reference

- [OpenGL ES Shading Language Reference](https://www.khronos.org/files/opengles_shading_language.pdf)
- [GLSL Quick Reference](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Tips for Learning Shaders

1. **Start Simple** - Begin with the Basic Gradient example and understand it fully
2. **Experiment** - Change values, colors, and formulas to see what happens
3. **Read Comments** - All examples are heavily commented to explain concepts
4. **Use Hot Reload** - Make small changes and see results immediately
5. **Study Examples** - Look at existing examples to learn patterns
6. **Reference Documentation** - Keep GLSL references handy

## Common GLSL Functions

Here are some useful GLSL functions you'll use often:

- `mix(a, b, t)` - Linear interpolation between a and b
- `sin(x)`, `cos(x)` - Trigonometric functions (great for animation)
- `length(v)` - Length of a vector
- `distance(a, b)` - Distance between two points
- `smoothstep(a, b, x)` - Smooth interpolation
- `clamp(x, min, max)` - Constrain value to range
- `dot(a, b)` - Dot product of two vectors
- `normalize(v)` - Normalize a vector to length 1

## Browser Support

This playground requires a browser with WebGL support:

- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### Blank screen or errors

1. Check browser console for errors
2. Ensure WebGL is supported: visit [https://get.webgl.org/](https://get.webgl.org/)
3. Try a different browser
4. Update graphics drivers

### Shader doesn't update

1. Check for syntax errors in console
2. Ensure file is saved
3. Try refreshing the page
4. Check that the shader file extension is `.glsl`

### Performance issues

1. Reduce geometry segments in examples
2. Simplify shader calculations
3. Check FPS counter in top-left corner
4. Close other browser tabs

## License

ISC

## Contributing

Feel free to add your own examples and share them! This is a learning project, so experimentation is encouraged.
