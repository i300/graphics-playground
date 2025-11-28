// Trail Decay Fragment Shader
// Reads previous frame's trails and applies decay

uniform sampler2D uPreviousTrail;
uniform float uDecayFactor;

varying vec2 vUv;

void main() {
  // Read previous frame's trail intensity
  vec4 previousTrail = texture2D(uPreviousTrail, vUv);

  // Apply decay factor (e.g., 0.9 = 90% retention)
  vec4 decayedTrail = previousTrail * uDecayFactor;

  gl_FragColor = decayedTrail;
}
