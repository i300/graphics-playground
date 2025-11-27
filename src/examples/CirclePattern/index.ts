import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import type { AnyControlConfig } from "../../types/controls";

/**
 * CirclePattern Example
 *
 * A shader that creates a circle using distance functions.
 * This example demonstrates:
 * - Distance calculations in fragment shaders
 * - Using smoothstep() for anti-aliased edges
 * - Centering UV coordinates
 * - Color mixing based on distance
 *
 * Great for learning distance-based rendering techniques!
 */
export class CirclePattern {
  public mesh: THREE.Mesh;

  /**
   * Control definitions for this example
   * No controls needed for static circle
   */
  static controls: AnyControlConfig[] = [];

  constructor(scene: THREE.Scene) {
    // Get canvas dimensions for aspect ratio correction in shader
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const aspect = width / height;

    // Create uniforms for aspect ratio correction
    const uniforms = {
      uResolution: { value: new THREE.Vector2(width, height) }
    };

    // Create a ShaderMaterial with our custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniforms,
      side: THREE.DoubleSide,
    });

    // Create a fullscreen quad that fills the orthographic camera view
    // The orthographic camera adjusts its bounds based on aspect ratio
    // so we need to match those bounds to fill the viewport
    const planeWidth = aspect > 1 ? aspect * 2 : 2;
    const planeHeight = aspect > 1 ? 2 : (1 / aspect) * 2;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // Create mesh and add to scene
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  /**
   * Update method called every frame
   * Not needed for static pattern, but required by the app structure
   */
  update(_time: number) {
    // No animation in this example
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
