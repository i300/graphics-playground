import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import type { AnyControlConfig } from "../../types/controls";

/**
 * BasicGradient Example
 *
 * A simple shader that creates a horizontal color gradient.
 * This example demonstrates:
 * - How to create a custom shader material
 * - UV coordinates and how they map to geometry
 * - Color mixing with the mix() function
 *
 * Perfect first shader for understanding the basics!
 */
export class BasicGradient {
  public mesh: THREE.Mesh;

  /**
   * Control definitions for this example
   * No controls needed for static gradient
   */
  static controls: AnyControlConfig[] = [];

  constructor(scene: THREE.Scene) {
    // Create a ShaderMaterial with our custom shaders
    // ShaderMaterial allows us to write custom GLSL code
    const material = new THREE.ShaderMaterial({
      vertexShader, // Our custom vertex shader
      fragmentShader, // Our custom fragment shader
      side: THREE.DoubleSide, // Render both sides of the geometry
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
   * Not needed for static gradient, but required by the app structure
   */
  update(_time: number) {
    // No animation in this example
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
