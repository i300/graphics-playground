/**
 * Basic Vertex Shader
 *
 * The vertex shader runs once for each vertex in the geometry.
 * Its main job is to transform vertex positions and pass data to the fragment shader.
 */

// varying: data passed from vertex shader to fragment shader
varying vec2 vUv;

void main() {
  // Pass UV coordinates to fragment shader
  // UV coordinates map the 2D texture space (0,0 to 1,1) onto the geometry
  // vUv.x goes from 0 (left) to 1 (right)
  // vUv.y goes from 0 (bottom) to 1 (top)
  vUv = uv;

  // Transform the vertex position from local space to screen space
  // projectionMatrix: converts from view space to clip space
  // modelViewMatrix: combines model and view transformations
  // position: the vertex position in local space
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
