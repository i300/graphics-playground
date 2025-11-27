import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import type { AnyControlConfig } from "../../types/controls";

/**
 * AnimatedWave Example
 *
 * An animated shader that creates a rippling wave effect.
 * This example demonstrates:
 * - Using uniforms to pass time data to shaders
 * - Vertex displacement for 3D effects
 * - Passing data from vertex to fragment shader
 * - Creating smooth animations with sine waves
 *
 * The wave continuously animates, showing how uniforms can be updated each frame.
 */
export class AnimatedWave {
  public mesh: THREE.Mesh;
  private uniforms: {
    uTime: { value: number };
  };

  /**
   * Control definitions for this example
   * These will be auto-generated in the UI
   */
  static controls: AnyControlConfig[] = [
    {
      name: "Time",
      property: "uTime",
      type: "readonly",
      format: (value: number) => `${value.toFixed(2)}s`,
    },
  ];

  constructor(scene: THREE.Scene) {
    // Setup uniforms - these are values we can update from JavaScript
    // They're passed to the shader and stay the same for all vertices/fragments in a single render
    this.uniforms = {
      uTime: { value: 0 }, // Time in seconds, updated each frame
    };

    // Create shader material with our custom shaders and uniforms
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
      // wireframe: true  // Uncomment to see the wave geometry
    });

    // Calculate aspect ratio to size the plane correctly
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;

    // Create a plane with more subdivisions to make the wave smooth
    // More segments = smoother wave but more vertices to process
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;
    const geometry = new THREE.PlaneGeometry(
      width, // width adjusted for aspect ratio
      height, // height adjusted for aspect ratio
      32, // width segments - creates a grid of vertices
      32 // height segments
    );

    // Create mesh and add to scene
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  /**
   * Update method called every frame
   * Updates the time uniform to animate the wave
   */
  update(time: number) {
    // Update the time uniform - this makes the wave animate
    this.uniforms.uTime.value = time;
  }

  /**
   * Clean up resources when switching examples
   */
  dispose() {
    // Remove mesh from scene first
    this.mesh.parent?.remove(this.mesh);
    // Then dispose of resources
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
