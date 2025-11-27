import "./style.css";
import * as THREE from "three";
import { Scene } from "./core/Scene";
import { Renderer } from "./core/Renderer";
import { Camera } from "./core/Camera";
import { Controls } from "./core/Controls";
import { ExampleSelector } from "./ui/ExampleSelector";
import { ControlPanel } from "./ui/ControlPanel";
import { exampleList } from "./examples";
import type { ViewMode } from "./types/controls";

/**
 * Main application class
 * Coordinates all components and manages the render loop
 */
class App {
  private scene: Scene;
  private renderer: Renderer;
  private camera: Camera;
  private controls: Controls;
  private exampleSelector: ExampleSelector;
  private controlPanel: ControlPanel;
  private currentExample: any = null;
  private startTime: number = Date.now();
  private frameCount: number = 0;
  private lastFpsUpdate: number = Date.now();
  private timeSpeed: number = 1.0;
  private isPaused: boolean = false;
  private pausedTime: number = 0;
  private lastPauseTime: number = 0;
  private currentViewMode: ViewMode = "shaded";

  constructor() {
    // Initialize core components
    this.scene = new Scene();
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.controls = new Controls(this.camera.camera, this.renderer.canvas);

    // Initialize control panel
    this.controlPanel = new ControlPanel(
      this.applyViewMode.bind(this),
      this.handleTimeSpeed.bind(this),
      this.handlePause.bind(this),
      this.handleTimeReset.bind(this)
    );

    // Initialize UI
    this.exampleSelector = new ExampleSelector(
      exampleList,
      this.loadExample.bind(this)
    );

    // Load first example
    if (exampleList.length > 0) {
      this.loadExample(exampleList[0].id);
    }

    // Setup event listeners
    this.setupEventListeners();

    // Start render loop
    this.animate();
  }

  /**
   * Load and display an example by ID
   */
  private loadExample(exampleId: string) {
    // Find the example configuration
    const exampleConfig = exampleList.find((ex) => ex.id === exampleId);
    if (!exampleConfig) {
      console.error(`Example ${exampleId} not found`);
      return;
    }

    // Clean up previous example
    if (this.currentExample) {
      this.currentExample.dispose();
      this.currentExample = null;
    }

    // Create new example instance
    this.currentExample = new exampleConfig.Example(this.scene.scene);

    // Rebuild control panel for new example
    const ExampleClass = exampleConfig.Example;
    const controls = ExampleClass.controls || [];
    this.controlPanel.rebuildForExample(this.currentExample, controls);

    // Update camera for 2D or 3D
    if (exampleConfig.is3D) {
      this.camera.setPerspective();
      this.controls.enable();
    } else {
      this.camera.setOrthographic();
      this.controls.disable();
    }

    // Apply the current view mode to the new example
    this.applyViewMode(this.currentViewMode);

    // Update UI
    this.exampleSelector.setActive(exampleId);

    console.log(`Loaded example: ${exampleConfig.name}`);
  }

  /**
   * Setup window event listeners
   */
  private setupEventListeners() {
    window.addEventListener("resize", () => {
      this.camera.updateAspect();
      this.renderer.resize();

      // Update current example if it has a resize method
      if (this.currentExample && "resize" in this.currentExample) {
        (this.currentExample as any).resize();
      }
    });
  }

  /**
   * Get elapsed time with speed multiplier and pause support
   */
  private getElapsedTime(): number {
    if (this.isPaused) {
      return this.pausedTime;
    }
    const realTime = (Date.now() - this.startTime) / 1000;
    return realTime * this.timeSpeed;
  }

  /**
   * Handle time speed change from control panel
   */
  private handleTimeSpeed(speed: number) {
    this.timeSpeed = speed;
  }

  /**
   * Handle pause toggle from control panel
   */
  private handlePause(paused: boolean) {
    if (paused) {
      this.isPaused = true;
      this.pausedTime = this.getElapsedTime();
      this.lastPauseTime = Date.now();
    } else {
      this.isPaused = false;
      const pauseDuration = Date.now() - this.lastPauseTime;
      this.startTime += pauseDuration;
    }
  }

  /**
   * Handle time reset from control panel
   */
  private handleTimeReset() {
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.isPaused = false;
  }

  /**
   * Apply view mode to current example
   */
  private applyViewMode(mode: ViewMode) {
    // Store the current view mode
    this.currentViewMode = mode;

    if (!this.currentExample?.mesh) return;

    const currentMesh = this.currentExample.mesh;
    const material = currentMesh.material as THREE.ShaderMaterial;

    switch (mode) {
      case "shaded":
        material.wireframe = false;
        break;

      case "wireframe":
        material.wireframe = true;
        break;
    }
  }

  /**
   * Update FPS counter
   */
  private updateFPS() {
    this.frameCount++;
    const now = Date.now();
    const elapsed = now - this.lastFpsUpdate;

    if (elapsed >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      const fpsElement = document.getElementById("fps");
      if (fpsElement) {
        fpsElement.textContent = `FPS: ${fps}`;
      }
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Animation loop
   */
  private animate = () => {
    requestAnimationFrame(this.animate);

    // Update controls
    this.controls.update();

    // Update current example with elapsed time
    if (
      this.currentExample &&
      typeof this.currentExample.update === "function"
    ) {
      const elapsedTime = this.getElapsedTime();
      this.currentExample.update(elapsedTime);
    }

    // Render scene
    this.renderer.render(this.scene.scene, this.camera.camera);

    // Update FPS counter
    this.updateFPS();
  };
}

// Start application when DOM is ready
new App();
