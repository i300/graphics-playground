// Particle Update Fragment Shader
// Implements the SENSE-ROTATE-MOVE algorithm for Physarum particles

uniform sampler2D uAgentState;  // Current particle positions/angles
uniform sampler2D uTrailMap;       // Current trail intensities
uniform float uSensorAngle;        // Sensor angle in radians (default: ~22.5°)
uniform float uSensorDistance;     // Sensor distance (normalized)
uniform float uRotationAngle;      // Rotation angle in radians (default: ~45°)
uniform float uStepSize;           // Movement step size (normalized)
uniform float uTime;               // For randomness seed

varying vec2 vUv;

const float PI = 3.14159265359;

// Helper function: Rotate a 2D vector by an angle
// Used to position the three sensors (left, front, right)
vec2 rotate(vec2 v, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

// Helper function: Generate pseudo-random number from 2D coordinate
// GLSL has no built-in random function, so we use this hash-based approach
// Output range: [0, 1]
float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // === READ CURRENT PARTICLE STATE ===
  // Each pixel in the particle state texture represents one particle
  // R channel = X position (0-1)
  // G channel = Y position (0-1)
  // B channel = Heading angle (0-1, representing 0-2π)
  // A channel = Reserved (species ID, etc.)
  vec4 particle = texture2D(uAgentState, vUv);
  vec2 pos = particle.xy;
  float angle = particle.z * 2.0 * PI; // Convert from [0,1] to [0,2π]

  // === SENSE: Sample trail at 3 sensor positions ===
  // Physarum particles have three "antennae" that detect pheromone trails
  // Think of it like a person looking left, forward, and right to decide which way to turn

  // Calculate forward direction vector from heading angle
  vec2 forward = vec2(cos(angle), sin(angle));

  // Position the sensor ahead of the particle
  vec2 sensorOffset = forward * uSensorDistance;

  // Calculate the three sensor positions:
  // LEFT:  Rotated counterclockwise by sensorAngle
  // FRONT: Straight ahead
  // RIGHT: Rotated clockwise by sensorAngle
  vec2 leftSensor = pos + rotate(sensorOffset, -uSensorAngle);
  vec2 frontSensor = pos + sensorOffset;
  vec2 rightSensor = pos + rotate(sensorOffset, uSensorAngle);

  // Sample the trail map at each sensor position
  // Using fract() wraps coordinates to create toroidal (wrapping) space
  // This means particles that move off one edge appear on the opposite edge
  float L = texture2D(uTrailMap, fract(leftSensor)).r;
  float F = texture2D(uTrailMap, fract(frontSensor)).r;
  float R = texture2D(uTrailMap, fract(rightSensor)).r;

  // === ROTATE: Decide new heading based on sensor readings ===
  // The rotation logic creates emergent behavior:
  // - Particles follow trails (chemotaxis)
  // - They explore when no trail is present
  // - They avoid going backwards
  float newAngle = angle;

  if (F > L && F > R) {
    // Front sensor has highest trail concentration
    // Continue forward - no rotation needed
    // This keeps particles following strong trails
  } else if (F < L && F < R) {
    // Front sensor has lowest trail concentration
    // Particle is facing away from trails - turn randomly to explore
    float rand = random(vUv + vec2(uTime));
    newAngle += (rand - 0.5) * uRotationAngle * 2.0;
  } else if (L > R) {
    // Left sensor detects stronger trail
    // Turn left (counterclockwise)
    newAngle -= uRotationAngle;
  } else if (R > L) {
    // Right sensor detects stronger trail
    // Turn right (clockwise)
    newAngle += uRotationAngle;
  } else {
    // Sensors detect equal values (all same or L == R)
    // Continue forward
  }

  // === MOVE: Calculate new position ===
  // Move forward in the new heading direction
  vec2 direction = vec2(cos(newAngle), sin(newAngle));
  vec2 newPos = pos + direction * uStepSize;

  // Wrap position to toroidal space [0,1]
  // This creates seamless wrapping at edges
  newPos = fract(newPos);

  // === OUTPUT: Write new particle state ===
  // Convert angle back to [0,1] for storage
  // The GPU will write this to the particle state texture
  // Next frame, this becomes the input particle state
  gl_FragColor = vec4(newPos, newAngle / (2.0 * PI), particle.a);
}
