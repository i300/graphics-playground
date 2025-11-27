/**
 * Basic Gradient Fragment Shader
 *
 * The fragment shader runs once for each pixel (fragment) in the geometry.
 * It determines the final color of each pixel.
 *
 * Learning objectives:
 * - Understanding UV coordinates
 * - Using the mix() function to blend colors
 * - Setting fragment colors with gl_FragColor
 */

// varying: receives data from the vertex shader
// This value is interpolated across the surface
varying vec2 vUv;

void main() {
  // Define two colors to create a gradient
  vec3 colorA = vec3(1.0, 0.0, 0.5);  // Pink (R=1, G=0, B=0.5)
  vec3 colorB = vec3(0.0, 0.5, 1.0);  // Blue (R=0, G=0.5, B=1)

  // mix() blends two values based on a third parameter (0.0 to 1.0)
  // When vUv.x = 0.0 (left side), we get colorA
  // When vUv.x = 1.0 (right side), we get colorB
  // Values in between create a smooth gradient
  vec3 color = mix(colorA, colorB, vUv.x);

  // Set the final pixel color
  // vec4 has 4 components: (red, green, blue, alpha)
  // Alpha = 1.0 means fully opaque
  gl_FragColor = vec4(color, 1.0);
}
