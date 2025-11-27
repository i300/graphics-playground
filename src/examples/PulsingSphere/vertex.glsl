/**
 * Pulsing Sphere Vertex Shader
 *
 * Animates vertex positions to create a pulsing effect.
 */

// Uniforms passed from JavaScript
uniform float uTime;

// varying: data passed to fragment shader
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Calculate pulsing effect using sine wave
  // sin() oscillates between -1 and 1
  // We scale it down and add 1.0 to get a pulse between 0.9 and 1.1
  float pulse = sin(uTime * 2.0) * 0.1 + 1.0;

  // Create additional wave pattern based on position
  // This creates a rippling effect across the sphere
  float wave = sin(position.y * 5.0 + uTime * 3.0) * 0.05;

  // Displace vertices along their normals
  // Normals point outward from the sphere surface
  // This makes the sphere expand and contract
  vec3 newPosition = position + normal * (pulse * 0.2 + wave);

  // Pass data to fragment shader
  vPosition = newPosition;
  vNormal = normalize(normalMatrix * normal);

  // Transform to screen space
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
