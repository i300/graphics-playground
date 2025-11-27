/**
 * Rotating Cube Fragment Shader
 *
 * Creates colorful patterns on a 3D cube using position and normals.
 *
 * Learning objectives:
 * - Using 3D position data for coloring
 * - Understanding normals in 3D space
 * - Creating simple lighting effects
 * - Working with 3D geometry
 */

// Receive position and normal from vertex shader
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Normalize the position to get colors in 0-1 range
  // Position values on a cube go from -0.5 to 0.5
  // Adding 0.5 shifts to 0.0 to 1.0 range
  vec3 posColor = vPosition * 0.5 + 0.5;

  // Use normals for simple directional shading
  // Normals point away from the surface
  // We'll use them to add depth perception
  vec3 normalColor = vNormal * 0.5 + 0.5;

  // Mix position-based color with normal-based shading
  // This creates a colorful cube where each face has directional shading
  vec3 color = mix(posColor, normalColor, 0.3);

  // Add some brightness
  color = color * 1.2;

  // Set the final pixel color
  gl_FragColor = vec4(color, 1.0);
}
