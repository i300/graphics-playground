import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import type { AnyControlConfig } from "../../types/controls";

/**
 * RotatingCube Example
 *
 * A simple 3D cube with custom shaders that rotates continuously.
 * This example demonstrates:
 * - Creating 3D geometry (BoxGeometry)
 * - Using position data in shaders for coloring
 * - Working with normals for basic shading
 * - Rotating 3D objects with OrbitControls
 *
 * Your first step into 3D shader programming!
 */
export class RotatingCube {
  public mesh: THREE.Mesh;

  /**
   * Control definitions for this example
   */
  static controls: AnyControlConfig[] = [];

  constructor(scene: THREE.Scene) {
    // Create shader material with custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });

    // Create a box geometry (cube)
    // Parameters: width, height, depth
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Create mesh and add to scene
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  /**
   * Update method called every frame
   * Rotates the cube automatically
   */
  update(time: number) {
    // Rotate the cube on X and Y axes for a nice tumbling effect
    // Using time directly creates smooth, consistent rotation
    this.mesh.rotation.x = time * 0.5;
    this.mesh.rotation.y = time * 0.7;
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
