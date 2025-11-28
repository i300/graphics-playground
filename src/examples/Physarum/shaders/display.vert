// Display Vertex Shader
// Passthrough shader for fullscreen quad used to display final result

varying vec2 vUv;

void main() {
  // Pass UV coordinates to fragment shader
  vUv = uv;

  // Standard fullscreen quad positioning
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
