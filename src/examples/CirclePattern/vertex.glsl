/**
 * Circle Pattern Vertex Shader
 *
 * Simple passthrough vertex shader that sends UV coordinates to the fragment shader.
 */

// varying: data passed from vertex shader to fragment shader
varying vec2 vUv;

void main() {
  // Pass UV coordinates to fragment shader
  // UV coordinates map the 2D texture space (0,0 to 1,1) onto the geometry
  vUv = uv;

  // Transform the vertex position from local space to screen space
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
