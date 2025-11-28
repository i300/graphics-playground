// Deposit Fragment Shader
// Renders particle trails with smooth falloff

uniform float uDepositAmount; // How much trail intensity to deposit

void main() {
  // Map point coordinate from [0,1] to [-1,1] for distance calculation
  vec2 uv = gl_PointCoord * 2.0 - 1.0;

  // Calculate squared distance from center of point
  float d = dot(uv, uv);

  // Discard pixels outside the circular point
  if (d > 1.0) discard;

  // Create smooth circular falloff (bright center, fades to edges)
  float intensity = (1.0 - d) * uDepositAmount;

  // Output trail intensity (stored in R channel, same for G and B)
  gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
}
