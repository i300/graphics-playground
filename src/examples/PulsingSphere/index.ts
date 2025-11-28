import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import type { AnyControlConfig } from "../../types/controls";

/**
 * PulsingSphere Example
 *
 * A 3D sphere that pulses and ripples with animated colors.
 * This example demonstrates:
 * - Vertex displacement for geometry animation
 * - Creating sphere geometry
 * - Combining vertex and fragment animations
 * - Simple lighting with dot product
 * - Time-based color animation
 *
 * A mesmerizing example of animated 3D shaders!
 */
export class PulsingSphere {
  public mesh: THREE.Mesh;
  private renderer: THREE.WebGLRenderer;
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

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    // Setup uniforms for time-based animation
    this.uniforms = {
      uTime: { value: 0 },
    };

    // Create shader material with custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    });

    // Create a sphere geometry
    // Parameters: radius, widthSegments, heightSegments
    // More segments = smoother sphere and better animation
    const geometry = new THREE.SphereGeometry(0.8, 64, 64);

    // Create mesh and add to scene
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  /**
   * Update method called every frame
   * Updates the time uniform to animate the sphere
   */
  update(time: number) {
    // Update time for pulsing and color animation
    this.uniforms.uTime.value = time;

    // Slowly rotate the sphere to show all sides
    this.mesh.rotation.y = time * 0.3;
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
