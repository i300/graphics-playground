/**
 * Animated Wave Fragment Shader
 *
 * This shader demonstrates:
 * - Using varyings from the vertex shader
 * - Dynamic color based on vertex displacement
 * - Creating a visually interesting animated effect
 */

// Receive data from vertex shader
varying vec2 vUv;
varying float vElevation;

void main() {
  // Create color based on the wave elevation
  // Higher parts of the wave will be brighter/more cyan
  // Lower parts will be darker/more blue

  // Base color components
  float r = 0.1 + vElevation;              // Red increases with elevation
  float g = 0.4 + vElevation * 2.0;        // Green (main component)
  float b = 0.8 + vElevation;              // Blue (always strong)

  vec3 color = vec3(r, g, b);

  // Add some UV-based variation for extra visual interest
  color += vec3(vUv.x * 0.1, vUv.y * 0.1, 0.0);

  gl_FragColor = vec4(color, 1.0);
}
