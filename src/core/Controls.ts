import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Camera } from "three";

/**
 * Controls wrapper class
 * Manages OrbitControls for 3D camera interaction
 */
export class Controls {
  private controls: OrbitControls;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.controls = new OrbitControls(camera, canvas);

    // Enable damping for smooth camera movement
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Start disabled (will be enabled for 3D examples)
    this.controls.enabled = false;
  }

  /**
   * Enable orbit controls for 3D examples
   */
  enable() {
    this.controls.enabled = true;
  }

  /**
   * Disable orbit controls for 2D examples
   */
  disable() {
    this.controls.enabled = false;
  }

  /**
   * Update controls (required when damping is enabled)
   */
  update() {
    if (this.controls.enabled) {
      this.controls.update();
    }
  }
}
