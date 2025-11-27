/**
 * Examples Registry
 *
 * This file exports all available shader examples.
 * Add new examples here to make them available in the playground.
 */

import { BasicGradient } from "./BasicGradient";
import { AnimatedWave } from "./AnimatedWave";
import { CirclePattern } from "./CirclePattern";
import { RotatingColors } from "./RotatingColors";
import { RotatingCube } from "./RotatingCube";
import { PulsingSphere } from "./PulsingSphere";

/**
 * Example configuration interface
 */
export interface ExampleConfig {
  id: string;
  name: string;
  description: string;
  Example: any; // The example class constructor
  is3D: boolean; // Whether this example uses 3D camera controls
}

/**
 * List of all available examples
 * Examples are displayed in this order in the sidebar
 */
export const exampleList: ExampleConfig[] = [
  {
    id: "basic-gradient",
    name: "Basic Gradient",
    description:
      "Simple horizontal color gradient. Learn UV coordinates and color mixing.",
    Example: BasicGradient,
    is3D: false,
  },
  {
    id: "circle-pattern",
    name: "Circle Pattern",
    description:
      "Circle using distance functions. Learn distance(), smoothstep(), and anti-aliasing.",
    Example: CirclePattern,
    is3D: false,
  },
  {
    id: "animated-wave",
    name: "Animated Wave",
    description:
      "Rippling wave effect. Learn uniforms, time-based animation, and vertex displacement.",
    Example: AnimatedWave,
    is3D: false,
  },
  {
    id: "rotating-colors",
    name: "Rotating Colors",
    description:
      "Spinning color patterns. Learn atan(), radial patterns, and color animation.",
    Example: RotatingColors,
    is3D: false,
  },
  {
    id: "rotating-cube",
    name: "Rotating Cube",
    description:
      "Colorful 3D cube. Learn 3D geometry, position-based colors, and OrbitControls.",
    Example: RotatingCube,
    is3D: true,
  },
  {
    id: "pulsing-sphere",
    name: "Pulsing Sphere",
    description:
      "Animated 3D sphere. Learn vertex displacement, lighting, and combined effects.",
    Example: PulsingSphere,
    is3D: true,
  },
];
