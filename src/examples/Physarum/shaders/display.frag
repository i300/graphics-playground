// Display Fragment Shader
// Visualizes the simulation with color mapping and debug modes

uniform sampler2D uTrailMap;       // Trail map to display
uniform sampler2D uAgentState;   // Particle positions (for debug mode)
uniform int uDebugMode;             // 0=trails only, 1=particles only, 2=both

varying vec2 vUv;

void main() {
  vec3 color = vec3(0.0);

  // === MODE 0 or 2: SHOW TRAILS ===
  if (uDebugMode == 0 || uDebugMode == 2) {
    // Read trail intensity
    float trail = texture2D(uTrailMap, vUv).r;

    // Map trail intensity to a cyan-purple color gradient
    // This creates the distinctive Physarum aesthetic
    // Low intensity = dark blue/purple
    // High intensity = bright cyan
    vec3 trailColor = vec3(
      trail * 2.0,      // Red: bright in high intensity areas
      trail,            // Green: moderate
      trail * 0.5       // Blue: subtle
    );

    color += trailColor;
  }

  // === MODE 1 or 2: SHOW PARTICLES ===
  if (uDebugMode == 1 || uDebugMode == 2) {
    // This is a simplified particle visualization
    // In a full implementation, you'd render actual points
    // Here we just brighten pixels near particle positions
    // This is mainly useful for debugging

    // Sample the particle state texture at current position
    vec4 particle = texture2D(uAgentState, vUv);

    // Create a simple threshold to show where particles are
    // This won't show exact particle positions, but gives a sense of distribution
    float particleDensity = step(0.5, particle.r + particle.g);

    // Add bright white dots where particles are concentrated
    color += vec3(particleDensity * 0.1);
  }
  
  gl_FragColor = vec4(color, 1.0);
}
