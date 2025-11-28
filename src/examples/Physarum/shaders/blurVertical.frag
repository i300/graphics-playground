// Vertical Blur Fragment Shader
// Implements separable Gaussian blur (vertical pass) with decay

uniform sampler2D uTrailMap;   // Trail map to blur (from horizontal pass)
uniform float uDecayFactor;     // Decay factor (e.g., 0.9 = retain 90% per frame)

varying vec2 vUv;

void main() {
  // Texel size - distance between adjacent pixels
  vec2 texelSize = vec2(1.0 / 1024.0);

  // === VERTICAL BLUR ===
  // Sample 3 vertical neighbors and apply Gaussian weights
  // This completes the separable blur started in the horizontal pass

  // Sample top neighbor (weight: 0.25)
  vec3 blur = texture2D(uTrailMap, vUv - vec2(0.0, texelSize.y)).rgb * 0.25;

  // Sample center pixel (weight: 0.5)
  blur += texture2D(uTrailMap, vUv).rgb * 0.5;

  // Sample bottom neighbor (weight: 0.25)
  blur += texture2D(uTrailMap, vUv + vec2(0.0, texelSize.y)).rgb * 0.25;

  // === DECAY ===
  // Apply decay factor again
  // Since we decay in both passes, the effective decay per frame is:
  // effectiveDecay = decayFactor * decayFactor
  // For decayFactor = 0.9, effective decay = 0.81
  // This is intentional and can be adjusted
  blur *= uDecayFactor;

  gl_FragColor = vec4(blur, 1.0);
}
