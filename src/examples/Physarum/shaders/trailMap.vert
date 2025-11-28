// Deposit Vertex Shader
// Reads particle positions from texture and renders them as points

uniform sampler2D uAgentState;
uniform float uNumAgents;
attribute float aAgentIndex;

void main() {
  // Convert linear particle index to 2D texture coordinates
  // The agent texture is square with size = ceil(sqrt(numAgents))
  // For 512 agents, this is a 23x23 texture
  float size = ceil(sqrt(uNumAgents));
  float row = floor(aAgentIndex / size);
  float col = mod(aAgentIndex, size);
  vec2 uv = vec2(col, row) / size;

  // Read particle position from state texture
  // R = X position, G = Y position (both normalized 0-1)
  vec4 particleData = texture2D(uAgentState, uv);
  vec2 pos = particleData.xy;

  // Convert position from [0,1] to clip space [-1,1]
  // This positions the particle correctly on screen
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);

  // Set point size for trail deposition
  // Larger points create thicker trails
  gl_PointSize = 2.0;
}
