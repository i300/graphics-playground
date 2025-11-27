import GUI from "lil-gui";
import * as THREE from "three";
import type {
  AnyControlConfig,
  SliderControlConfig,
  ColorControlConfig,
  ToggleControlConfig,
  ReadonlyControlConfig,
  ViewMode,
} from "../types/controls";

/**
 * ControlPanel manages interactive GUI controls using lil-gui
 *
 * Features:
 * - Auto-generates controls from example uniforms
 * - Global view mode controls (wireframe, points, shaded)
 * - Time controls (speed, pause, reset)
 * - Automatically rebuilds when examples switch
 */
export class ControlPanel {
  private gui: GUI;
  private exampleFolder: GUI | null = null;
  private viewModeFolder: GUI;
  private timeFolder: GUI;

  // State
  private currentExample: any = null;
  private viewMode: ViewMode = "shaded";
  private timeSpeed: number = 1.0;
  private isPaused: boolean = false;

  // Callbacks
  private onViewModeChange: (mode: ViewMode) => void;
  private onTimeSpeedChange: (speed: number) => void;
  private onPauseToggle: (paused: boolean) => void;
  private onTimeReset: () => void;

  constructor(
    onViewModeChange: (mode: ViewMode) => void,
    onTimeSpeedChange: (speed: number) => void,
    onPauseToggle: (paused: boolean) => void,
    onTimeReset: () => void
  ) {
    // Initialize GUI in top-right corner
    this.gui = new GUI({ title: "Controls", width: 300 });

    // Store callbacks
    this.onViewModeChange = onViewModeChange;
    this.onTimeSpeedChange = onTimeSpeedChange;
    this.onPauseToggle = onPauseToggle;
    this.onTimeReset = onTimeReset;

    // Create persistent folders
    this.viewModeFolder = this.createViewModeFolder();
    this.timeFolder = this.createTimeFolder();
  }

  /**
   * Rebuild controls for a new example
   */
  rebuildForExample(example: any, controlsMetadata?: AnyControlConfig[]) {
    // Remove existing example folder
    if (this.exampleFolder) {
      this.exampleFolder.destroy();
      this.exampleFolder = null;
    }

    this.currentExample = example;

    // Create new example folder if controls are defined
    if (controlsMetadata && controlsMetadata.length > 0) {
      this.exampleFolder = this.gui.addFolder("Example Controls");
      this.exampleFolder.open();

      controlsMetadata.forEach((config) => {
        this.addControl(config);
      });
    }
  }

  /**
   * Add a control based on configuration
   */
  private addControl(config: AnyControlConfig) {
    if (!this.exampleFolder || !this.currentExample?.uniforms) return;

    const uniform = this.currentExample.uniforms[config.property];
    if (!uniform) {
      console.warn(`Uniform ${config.property} not found in example`);
      return;
    }

    switch (config.type) {
      case "slider":
        this.addSliderControl(config as SliderControlConfig, uniform);
        break;
      case "color":
        this.addColorControl(config as ColorControlConfig, uniform);
        break;
      case "toggle":
        this.addToggleControl(config as ToggleControlConfig, uniform);
        break;
      case "readonly":
        this.addReadonlyControl(config as ReadonlyControlConfig, uniform);
        break;
    }
  }

  /**
   * Add slider control for numeric uniforms
   */
  private addSliderControl(config: SliderControlConfig, uniform: any) {
    this.exampleFolder!.add(
      uniform,
      "value",
      config.min,
      config.max,
      config.step
    ).name(config.name);
  }

  /**
   * Add color control for vec3 uniforms
   */
  private addColorControl(config: ColorControlConfig, uniform: any) {
    // Convert THREE.Color or array to hex for lil-gui
    const colorProxy = {
      value:
        uniform.value instanceof THREE.Color
          ? uniform.value.getHex()
          : this.vec3ToHex(uniform.value),
    };

    this.exampleFolder!.addColor(colorProxy, "value")
      .name(config.name)
      .onChange((hex: number) => {
        if (uniform.value instanceof THREE.Color) {
          uniform.value.setHex(hex);
        } else {
          const color = new THREE.Color(hex);
          uniform.value[0] = color.r;
          uniform.value[1] = color.g;
          uniform.value[2] = color.b;
        }
      });
  }

  /**
   * Add toggle control for boolean uniforms
   */
  private addToggleControl(config: ToggleControlConfig, uniform: any) {
    this.exampleFolder!.add(uniform, "value").name(config.name);
  }

  /**
   * Add read-only display
   */
  private addReadonlyControl(config: ReadonlyControlConfig, uniform: any) {
    const controller = this.exampleFolder!.add(uniform, "value")
      .name(config.name)
      .disable();

    if (config.format) {
      controller.onChange((value: any) => {
        controller.name(config.format!(value));
      });
    }
  }

  /**
   * Create view mode folder
   */
  private createViewModeFolder(): GUI {
    const folder = this.gui.addFolder("View Mode");
    folder.open();

    const modes = {
      mode: this.viewMode,
    };

    folder
      .add(modes, "mode", ["shaded", "wireframe"])
      .name("Render Mode")
      .onChange((mode: ViewMode) => {
        this.viewMode = mode;
        this.onViewModeChange(mode);
      });

    return folder;
  }

  /**
   * Create time control folder
   */
  private createTimeFolder(): GUI {
    const folder = this.gui.addFolder("Time Controls");
    folder.open();

    // Create settings object for time speed
    const timeSettings = {
      speed: this.timeSpeed,
    };

    // Speed multiplier
    folder
      .add(timeSettings, "speed", 0, 3, 0.1)
      .name("Speed")
      .onChange((speed: number) => {
        this.timeSpeed = speed;
        this.onTimeSpeedChange(speed);
      });

    // Pause/Resume button
    folder
      .add({ toggle: () => this.togglePause() }, "toggle")
      .name("Pause / Resume");

    // Reset button
    folder.add({ reset: () => this.onTimeReset() }, "reset").name("Reset Time");

    return folder;
  }

  /**
   * Toggle pause state
   */
  private togglePause() {
    this.isPaused = !this.isPaused;
    this.onPauseToggle(this.isPaused);
  }

  /**
   * Update view mode (called externally)
   */
  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
  }

  /**
   * Helper: Convert vec3 array to hex
   */
  private vec3ToHex(vec: number[]): number {
    const color = new THREE.Color(vec[0], vec[1], vec[2]);
    return color.getHex();
  }

  /**
   * Clean up
   */
  dispose() {
    this.gui.destroy();
  }
}
