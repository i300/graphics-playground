import * as THREE from "three";

/**
 * Camera wrapper class
 * Manages both perspective (3D) and orthographic (2D) cameras
 */
export class Camera {
  public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private orthographicCamera: THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement;

  constructor() {
    // Get canvas element for aspect ratio calculations
    this.canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

    // Setup perspective camera for 3D examples
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      75, // Field of view
      aspect, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.perspectiveCamera.position.z = 3;

    // Setup orthographic camera for 2D shader examples
    // Adjust bounds based on aspect ratio to maintain square coordinate space
    // This ensures circles render as circles, not ovals
    let left, right, top, bottom;
    if (aspect > 1) {
      // Wider than tall: expand horizontally
      left = -aspect;
      right = aspect;
      top = 1;
      bottom = -1;
    } else {
      // Taller than wide: expand vertically
      left = -1;
      right = 1;
      top = 1 / aspect;
      bottom = -1 / aspect;
    }

    this.orthographicCamera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      0.1,
      10 // near, far
    );
    this.orthographicCamera.position.z = 1;

    // Default to perspective camera
    this.camera = this.perspectiveCamera;
  }

  /**
   * Switch to perspective camera for 3D examples
   */
  setPerspective() {
    this.camera = this.perspectiveCamera;
  }

  /**
   * Switch to orthographic camera for 2D shader examples
   */
  setOrthographic() {
    this.camera = this.orthographicCamera;
  }

  /**
   * Update camera aspect ratio on window resize
   */
  updateAspect() {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

    // Update perspective camera
    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    // Update orthographic camera bounds to maintain square coordinate space
    if (aspect > 1) {
      // Wider than tall: expand horizontally
      this.orthographicCamera.left = -aspect;
      this.orthographicCamera.right = aspect;
      this.orthographicCamera.top = 1;
      this.orthographicCamera.bottom = -1;
    } else {
      // Taller than wide: expand vertically
      this.orthographicCamera.left = -1;
      this.orthographicCamera.right = 1;
      this.orthographicCamera.top = 1 / aspect;
      this.orthographicCamera.bottom = -1 / aspect;
    }
    this.orthographicCamera.updateProjectionMatrix();
  }
}
