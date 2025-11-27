/**
 * Rotating Colors Fragment Shader
 *
 * Creates a rotating color pattern using angles and time.
 *
 * Learning objectives:
 * - Using atan() to calculate angles
 * - Creating circular/radial patterns
 * - Animating with time-based rotation
 * - Generating colors from mathematical functions
 */

// Receive UV coordinates from vertex shader
varying vec2 vUv;

// Uniform for time-based animation
uniform float uTime;

void main() {
  // Center the coordinates (move origin to center of screen)
  vec2 center = vUv - 0.5;

  // Calculate angle from center using atan(y, x)
  // atan() returns angle in radians (-PI to PI)
  // This creates a radial pattern emanating from the center
  float angle = atan(center.y, center.x);

  // Calculate distance from center for radial effect
  float dist = length(center);

  // Rotate the angle over time
  // Adding uTime makes the pattern spin clockwise
  // Multiply by 2.0 to control rotation speed
  float rotatingAngle = angle + uTime * 0.5;

  // Create color based on rotating angle and distance
  // sin() oscillates between -1 and 1, so we adjust to 0 to 1 range
  // Different frequencies create different color patterns
  float r = sin(rotatingAngle * 3.0) * 0.5 + 0.5;
  float g = sin(rotatingAngle * 2.0 + dist * 5.0) * 0.5 + 0.5;
  float b = sin(rotatingAngle * 4.0 - dist * 3.0) * 0.5 + 0.5;

  vec3 color = vec3(r, g, b);

  // Add brightness based on distance from center
  // Makes it brighter in the middle, darker at edges
  color *= 1.0 - dist * 0.5;

  // Set the final pixel color
  gl_FragColor = vec4(color, 1.0);
}
