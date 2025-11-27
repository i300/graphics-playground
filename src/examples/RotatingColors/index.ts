import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import type { AnyControlConfig } from "../../types/controls";

/**
 * RotatingColors Example
 *
 * An animated shader that creates rotating color patterns.
 * This example demonstrates:
 * - Using atan() to create radial/circular patterns
 * - Time-based rotation animation
 * - Combining angles and distance for complex effects
 * - Creating colors from mathematical functions
 *
 * Watch the colors spin and blend in mesmerizing patterns!
 */
export class RotatingColors {
  public mesh: THREE.Mesh;
  private uniforms: {
    uTime: { value: number };
  };

  /**
   * Control definitions for this example
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
    // Setup uniforms for time-based animation
    this.uniforms = {
      uTime: { value: 0 },
    };

    // Create shader material with our custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    });

    // Calculate aspect ratio to size the plane correctly
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;

    // Create a fullscreen quad that accounts for aspect ratio
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;
    const geometry = new THREE.PlaneGeometry(width, height);

    // Create mesh and add to scene
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  /**
   * Update method called every frame
   * Updates the time uniform to animate the rotation
   */
  update(time: number) {
    this.uniforms.uTime.value = time;
  }

  /**
   * Update geometry when window is resized
   * Ensures the plane always fills the viewport
   */
  resize() {
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;

    // Calculate new dimensions
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;

    // Dispose old geometry and create new one
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(width, height);
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
