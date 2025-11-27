import * as THREE from "three";

/**
 * Renderer wrapper class
 * Manages the WebGL renderer and canvas sizing
 */
export class Renderer {
  public renderer: THREE.WebGLRenderer;
  public canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

    if (!this.canvas) {
      throw new Error("Canvas element not found");
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });

    // Set pixel ratio for sharper rendering on high-DPI displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.resize();
  }

  /**
   * Resize the renderer to match canvas dimensions
   */
  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
  }

  /**
   * Render the scene with the given camera
   */
  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);
  }
}
