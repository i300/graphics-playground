/**
 * Pulsing Sphere Fragment Shader
 *
 * Creates animated colors on a 3D sphere with lighting.
 *
 * Learning objectives:
 * - Animating colors with time
 * - Creating simple lighting with normals
 * - Combining multiple effects (pulsing geometry + animated colors)
 * - Using dot product for basic lighting
 */

// Receive position and normal from vertex shader
varying vec3 vPosition;
varying vec3 vNormal;

// Time uniform for color animation
uniform float uTime;

void main() {
  // Create a light direction (coming from upper right)
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

  // Calculate how much the surface faces the light using dot product
  // dot(a, b) gives the cosine of the angle between two vectors
  // When surface faces light: dot = 1.0 (bright)
  // When surface faces away: dot = -1.0 (dark)
  float lightIntensity = dot(vNormal, lightDir) * 0.5 + 0.5;

  // Create animated colors using position and time
  // Different frequencies create interesting patterns
  float r = sin(vPosition.x * 3.0 + uTime) * 0.5 + 0.5;
  float g = sin(vPosition.y * 3.0 + uTime * 1.5) * 0.5 + 0.5;
  float b = sin(vPosition.z * 3.0 + uTime * 2.0) * 0.5 + 0.5;

  vec3 color = vec3(r, g, b);

  // Apply lighting to the color
  // This makes the sphere look 3D by showing light and shadow
  color *= lightIntensity * 1.5;

  // Add some ambient light so it's never completely dark
  color += vec3(0.1, 0.1, 0.15);

  // Set the final pixel color
  gl_FragColor = vec4(color, 1.0);
}
