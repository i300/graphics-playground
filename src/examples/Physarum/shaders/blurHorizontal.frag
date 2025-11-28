// Horizontal Blur Fragment Shader
// Implements separable Gaussian blur (horizontal pass) with decay

uniform sampler2D uTrailMap;   // Trail map to blur
uniform float uDecayFactor;     // Decay factor (e.g., 0.9 = retain 90% per frame)

varying vec2 vUv;

void main() {
  // Texel size - distance between adjacent pixels
  // We're working with a 1024x1024 texture
  vec2 texelSize = vec2(1.0 / 1024.0);

  // === HORIZONTAL BLUR ===
  // Sample 3 horizontal neighbors and apply Gaussian weights
  // This is a "separable" blur - we blur horizontally here,
  // then vertically in a separate pass
  // This is much faster than a full 2D blur (6 samples vs 9)

  // Sample left neighbor (weight: 0.25)
  vec3 blur = texture2D(uTrailMap, vUv - vec2(texelSize.x, 0.0)).rgb * 0.25;

  // Sample center pixel (weight: 0.5)
  blur += texture2D(uTrailMap, vUv).rgb * 0.5;

  // Sample right neighbor (weight: 0.25)
  blur += texture2D(uTrailMap, vUv + vec2(texelSize.x, 0.0)).rgb * 0.25;

  // === DECAY ===
  // Multiply by decay factor to make trails fade over time
  // This prevents the simulation from reaching equilibrium
  // and keeps patterns dynamic
  blur *= uDecayFactor;

  gl_FragColor = vec4(blur, 1.0);
}
