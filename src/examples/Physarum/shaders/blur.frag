// Single-Pass Blur + Decay Fragment Shader
// Samples all 8 neighbors in a 3x3 grid, averages them, and applies decay

uniform sampler2D uTrailMap;   // Trail map to blur
uniform vec2 uResolution;       // Texture resolution (width, height)
uniform float uDecayFactor;     // Decay rate per second (e.g., 0.5 = fade by 0.5 per second)
uniform float uDeltaTime;       // Time since last frame in seconds
uniform float uDiffuseWeight;   // How much blur to apply (0.0 = no blur, 1.0 = full blur)

varying vec2 vUv;

void main() {
  // Texel size - distance between adjacent pixels
  vec2 texelSize = 1.0 / uResolution;

  // === SIMPLE BOX BLUR ===
  // Sample all 8 neighbors plus center pixel (3x3 grid)
  // and average them for a simple, fast blur effect

  vec3 sum = vec3(0.0);

  // Top row
  sum += texture2D(uTrailMap, vUv + vec2(-texelSize.x, texelSize.y)).rgb;   // Top-left
  sum += texture2D(uTrailMap, vUv + vec2(0.0, texelSize.y)).rgb;            // Top-center
  sum += texture2D(uTrailMap, vUv + vec2(texelSize.x, texelSize.y)).rgb;    // Top-right

  // Middle row
  sum += texture2D(uTrailMap, vUv + vec2(-texelSize.x, 0.0)).rgb;           // Middle-left
  sum += texture2D(uTrailMap, vUv).rgb;                                      // Center
  sum += texture2D(uTrailMap, vUv + vec2(texelSize.x, 0.0)).rgb;            // Middle-right

  // Bottom row
  sum += texture2D(uTrailMap, vUv + vec2(-texelSize.x, -texelSize.y)).rgb;  // Bottom-left
  sum += texture2D(uTrailMap, vUv + vec2(0.0, -texelSize.y)).rgb;           // Bottom-center
  sum += texture2D(uTrailMap, vUv + vec2(texelSize.x, -texelSize.y)).rgb;   // Bottom-right

  // Average all 9 samples
  vec3 blur = sum / 9.0;

  // Lerp between original (center pixel) and blurred based on diffuse weight
  vec3 original = texture2D(uTrailMap, vUv).rgb;
  vec3 diffused = mix(original, blur, uDiffuseWeight);

  // Apply framerate-independent decay to the diffused result
  // Decay is scaled by delta time so it's consistent regardless of framerate
  vec3 finalColor = max(vec3(0.0), diffused - vec3(uDecayFactor * uDeltaTime));

  gl_FragColor = vec4(finalColor, 1.0);
}
