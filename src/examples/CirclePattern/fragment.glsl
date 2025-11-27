/**
 * Circle Pattern Fragment Shader
 *
 * Creates a circle using distance functions and smoothstep.
 *
 * Learning objectives:
 * - Using distance() to calculate pixel distance from a point
 * - Using smoothstep() for smooth edges
 * - Centering coordinates by subtracting 0.5
 * - Correcting for aspect ratio to render perfect circles
 */

// Resolution of the canvas (width, height)
// Used to calculate aspect ratio for correct circle rendering
uniform vec2 uResolution;

// Receive UV coordinates from vertex shader
varying vec2 vUv;

void main() {
  // Calculate aspect ratio from canvas resolution
  // aspect > 1 means wider than tall (e.g., 1920/1080 = 1.78)
  // aspect < 1 means taller than wide (e.g., 1080/1920 = 0.56)
  float aspect = uResolution.x / uResolution.y;

  // Center the coordinates
  // UV goes from 0 to 1, but we want -0.5 to 0.5 for centered calculations
  vec2 uv = vUv - 0.5;

  // Correct for aspect ratio to create square coordinate space
  // Without this, circles would appear as ovals on non-square viewports
  // We divide the x-coordinate by aspect to compress the UV space proportionally
  uv.x *= aspect;

  // Calculate distance from the center point (0, 0)
  // length() is the same as distance(uv, vec2(0.0))
  // Now this works correctly because UV space is square
  // At the center: dist = 0.0
  // At the edges: dist varies based on aspect ratio
  float dist = length(uv);

  // Create a circle using smoothstep for soft edges
  // smoothstep(edge0, edge1, x) returns 0 when x < edge0, 1 when x > edge1
  // Values between edge0 and edge1 are smoothly interpolated
  // We use 1.0 - smoothstep to invert it (white circle on black background)
  float circle = 1.0 - smoothstep(0.2, 0.22, dist);

  // Define colors
  vec3 backgroundColor = vec3(0.1, 0.1, 0.15);  // Dark blue-gray
  vec3 circleColor = vec3(0.2, 0.8, 0.9);       // Cyan

  // Mix the colors based on the circle value
  vec3 color = mix(backgroundColor, circleColor, circle);

  // Set the final pixel color
  gl_FragColor = vec4(color, 1.0);
}
