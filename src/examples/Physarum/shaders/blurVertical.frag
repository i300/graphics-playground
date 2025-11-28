// Vertical Blur Fragment Shader
// Implements separable Gaussian blur (vertical pass) with decay

uniform sampler2D uTrailMap;   // Trail map to blur (from horizontal pass)
uniform vec2 uResolution;       // Texture resolution (width, height)

varying vec2 vUv;

void main() {
  // Texel size - distance between adjacent pixels
  vec2 texelSize = 1.0 / uResolution;

  // === GAUSSIAN BLUR (VERTICAL) ===
  // 9-tap Gaussian blur with sigma=2.0
  // This completes the separable blur started in the horizontal pass
  // Using the same weights for consistency

  vec3 blur = vec3(0.0);

  // Center pixel (offset 0, weight: 0.227027)
  blur += texture2D(uTrailMap, vUv).rgb * 0.227027;

  // Offset ±1 pixels (weight: 0.194594)
  blur += texture2D(uTrailMap, vUv - vec2(0.0, texelSize.y * 1.0)).rgb * 0.194594;
  blur += texture2D(uTrailMap, vUv + vec2(0.0, texelSize.y * 1.0)).rgb * 0.194594;

  // Offset ±2 pixels (weight: 0.121622)
  blur += texture2D(uTrailMap, vUv - vec2(0.0, texelSize.y * 2.0)).rgb * 0.121622;
  blur += texture2D(uTrailMap, vUv + vec2(0.0, texelSize.y * 2.0)).rgb * 0.121622;

  // Offset ±3 pixels (weight: 0.054054)
  blur += texture2D(uTrailMap, vUv - vec2(0.0, texelSize.y * 3.0)).rgb * 0.054054;
  blur += texture2D(uTrailMap, vUv + vec2(0.0, texelSize.y * 3.0)).rgb * 0.054054;

  // Offset ±4 pixels (weight: 0.016216)
  blur += texture2D(uTrailMap, vUv - vec2(0.0, texelSize.y * 4.0)).rgb * 0.016216;
  blur += texture2D(uTrailMap, vUv + vec2(0.0, texelSize.y * 4.0)).rgb * 0.016216;

  gl_FragColor = vec4(blur, 1.0);
}
