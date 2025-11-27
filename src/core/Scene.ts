import * as THREE from "three";

/**
 * Scene wrapper class
 * Manages the Three.js scene and its background
 */
export class Scene {
  public scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    // Set dark background for better shader visibility
    this.scene.background = new THREE.Color(0x0a0a0a);
  }
}
