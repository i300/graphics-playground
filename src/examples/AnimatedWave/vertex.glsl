/**
 * Animated Wave Vertex Shader
 *
 * This shader demonstrates:
 * - Using uniforms (values passed from JavaScript)
 * - Vertex displacement (moving vertices to create waves)
 * - Passing multiple varyings to the fragment shader
 */

// uniform: a value passed from JavaScript that's the same for all vertices
uniform float uTime;

// varyings: data passed to fragment shader
varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;

  // Create a wave pattern using sine function
  // position.x: the x coordinate of each vertex
  // uTime: time in seconds, makes the wave animate
  // Multiply by 3.0 to increase wave frequency
  // Multiply result by 0.2 to control wave height
  float elevation = sin(position.x * 3.0 + uTime) * 0.2;

  // Also add a second wave in the Y direction for more complex motion
  elevation += sin(position.y * 2.0 - uTime * 0.5) * 0.15;

  // Pass elevation to fragment shader so we can color based on height
  vElevation = elevation;

  // Create a new position with the wave displacement
  vec3 newPosition = position;
  newPosition.z = elevation;  // Displace in Z direction

  // Transform the displaced position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
