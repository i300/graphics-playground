// Horizontal Blur Fragment Shader
// Implements separable Gaussian blur (horizontal pass) with decay

uniform sampler2D uTrailMap;   // Trail map to blur
uniform vec2 uResolution;       // Texture resolution (width, height)

varying vec2 vUv;

void main() {
  // Texel size - distance between adjacent pixels
  vec2 texelSize = 1.0 / uResolution;

  // === GAUSSIAN BLUR (HORIZONTAL) ===
  // 9-tap Gaussian blur with sigma=2.0
  // Weights calculated from Gaussian function: G(x) = exp(-(x^2)/(2*sigma^2))
  // Normalized so they sum to 1.0
  //
  // This is a "separable" blur - we blur horizontally here,
  // then vertically in a separate pass
  // This is much faster than a full 2D blur (18 samples vs 81)

  vec3 blur = vec3(0.0);

  // Center pixel (offset 0, weight: 0.227027)
  blur += texture2D(uTrailMap, vUv).rgb * 0.227027;

  // Offset ±1 pixels (weight: 0.194594)
  blur += texture2D(uTrailMap, vUv - vec2(texelSize.x * 1.0, 0.0)).rgb * 0.194594;
  blur += texture2D(uTrailMap, vUv + vec2(texelSize.x * 1.0, 0.0)).rgb * 0.194594;

  // Offset ±2 pixels (weight: 0.121622)
  blur += texture2D(uTrailMap, vUv - vec2(texelSize.x * 2.0, 0.0)).rgb * 0.121622;
  blur += texture2D(uTrailMap, vUv + vec2(texelSize.x * 2.0, 0.0)).rgb * 0.121622;

  // Offset ±3 pixels (weight: 0.054054)
  blur += texture2D(uTrailMap, vUv - vec2(texelSize.x * 3.0, 0.0)).rgb * 0.054054;
  blur += texture2D(uTrailMap, vUv + vec2(texelSize.x * 3.0, 0.0)).rgb * 0.054054;

  // Offset ±4 pixels (weight: 0.016216)
  blur += texture2D(uTrailMap, vUv - vec2(texelSize.x * 4.0, 0.0)).rgb * 0.016216;
  blur += texture2D(uTrailMap, vUv + vec2(texelSize.x * 4.0, 0.0)).rgb * 0.016216;

  gl_FragColor = vec4(blur, 1.0);
}
