/**
 * Rotating Cube Vertex Shader
 *
 * Passes position and normal data to the fragment shader for 3D coloring.
 */

// varying: data passed from vertex shader to fragment shader
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Pass the vertex position in model space to fragment shader
  // This will be used to create position-based colors
  vPosition = position;

  // Pass the vertex normal to fragment shader
  // Normals are perpendicular to the surface and useful for lighting
  vNormal = normalize(normalMatrix * normal);

  // Transform the vertex position from local space to screen space
  // In 3D mode, this uses the perspective camera
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
