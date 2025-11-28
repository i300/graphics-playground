/**
 * Control metadata interfaces
 * Defines how uniforms should be represented in the UI control panel
 */

/**
 * Base control configuration
 */
export interface ControlConfig {
  name: string; // Display name in UI
  property: string; // Uniform property name (e.g., 'uTime')
  type: ControlType; // Type of control to generate
}

/**
 * Types of controls supported
 */
export type ControlType = "slider" | "color" | "toggle" | "readonly" | "button";

/**
 * Slider control for numeric uniforms
 */
export interface SliderControlConfig extends ControlConfig {
  type: "slider";
  min: number;
  max: number;
  step: number;
}

/**
 * Color control for vec3/vec4 color uniforms
 */
export interface ColorControlConfig extends ControlConfig {
  type: "color";
}

/**
 * Toggle control for boolean uniforms
 */
export interface ToggleControlConfig extends ControlConfig {
  type: "toggle";
}

/**
 * Read-only display (e.g., for time)
 */
export interface ReadonlyControlConfig extends ControlConfig {
  type: "readonly";
  format?: (value: any) => string; // Optional formatter
}

/**
 * Button control for triggering actions
 */
export interface ButtonControlConfig extends ControlConfig {
  type: "button";
  callback?: () => void; // Optional - if not provided, looks for method on example
}

/**
 * Union type for all control configurations
 */
export type AnyControlConfig =
  | SliderControlConfig
  | ColorControlConfig
  | ToggleControlConfig
  | ReadonlyControlConfig
  | ButtonControlConfig;

/**
 * View mode options
 */
export type ViewMode = "shaded" | "wireframe";
