import * as THREE from "three";
import vertexShader from "./shaders/display.vert";
import fragmentShader from "./shaders/display.frag";
import agentSimFrag from "./shaders/agentSim.frag";
import agentSimVert from "./shaders/agentSim.vert";
import trailRenderVert from "./shaders/trailMap.vert";
import trailRenderFrag from "./shaders/trailMap.frag";
import trailDecayVert from "./shaders/trailDecay.vert";
import trailDecayFrag from "./shaders/trailDecay.frag";
import type { AnyControlConfig } from "../../types/controls";

function createAgentRenderTarget(numAgents: number) {
  const size = Math.ceil(Math.sqrt(numAgents));
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

function createTrailRenderTarget(width: number, height: number) {
  return new THREE.WebGLRenderTarget(width, height, {
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export class Physarum {
  // General display setup
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private uniforms: {
    uResolution: { value: THREE.Vector2 };
    uNumAgents: { value: number };
    uSensorAngle: { value: number };
    uSensorDistance: { value: number };
    uRotationAngle: { value: number };
    uStepSize: { value: number };
    uDepositAmount: { value: number };
    uDecayFactor: { value: number };
    uDebugMode: { value: number };
  };

  // Agent simulation
  private agentsRenderTargetA: THREE.WebGLRenderTarget;
  private agentsRenderTargetB: THREE.WebGLRenderTarget;
  private agentSimScene: THREE.Scene;
  private agentSimMaterial: THREE.ShaderMaterial;

  // Trail rendering
  private trailRenderTargetA: THREE.WebGLRenderTarget;
  private trailRenderTargetB: THREE.WebGLRenderTarget;
  private trailRenderScene: THREE.Scene;
  private trailRenderMaterial: THREE.ShaderMaterial;

  // Trail decay
  private trailDecayScene: THREE.Scene;
  private trailDecayMaterial: THREE.ShaderMaterial;

  /**
   * UI control definitions
   */
  static controls: AnyControlConfig[] = [
    {
      name: "Number of Agents",
      property: "uNumAgents",
      type: "slider",
      min: 4,
      max: 1024,
      step: 1,
    },
    {
      name: "Sensor Angle",
      property: "uSensorAngle",
      type: "slider",
      min: 0,
      max: 90,
      step: 1,
      // format: (value: number) => `${Math.round(value * (180 / Math.PI))}°`,
    },
    {
      name: "Sensor Distance",
      property: "uSensorDistance",
      type: "slider",
      min: 1,
      max: 50,
      step: 1,
      // format: (value: number) => `${Math.round(value * 1024)} px`,
    },
    {
      name: "Rotation Angle",
      property: "uRotationAngle",
      type: "slider",
      min: 0,
      max: 90,
      step: 1,
      // format: (value: number) => `${Math.round(value * (180 / Math.PI))}°`,
    },
    {
      name: "Step Size",
      property: "uStepSize",
      type: "slider",
      min: 0.1,
      max: 5,
      step: 0.1,
      // format: (value: number) => `${(value * 1024).toFixed(1)} px`,
    },
    {
      name: "Decay Factor",
      property: "uDecayFactor",
      type: "slider",
      min: 0.8,
      max: 0.99,
      step: 0.01,
    },
    {
      name: "Debug Mode",
      property: "uDebugMode",
      type: "slider",
      min: 0,
      max: 2,
      step: 1,
      // format: (value: number) =>
      //   ["Trails", "Particles", "Both"][Math.round(value)],
    },
  ];

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;

    // Create shared orthographic camera for all render passes
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Get canvas dimensions for aspect ratio correction in shader
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const aspect = width / height;

    // Initialize default uniforms to be passed to all simulation shaders
    this.uniforms = {
      uResolution: { value: new THREE.Vector2(width, height) },
      uNumAgents: { value: 1_000_000 }, // Texture size (e.g., 23 for 512 particles)
      uSensorAngle: { value: 22.5 * (Math.PI / 180) }, // 22.5 degrees in radians
      uSensorDistance: { value: 9.0 / 1024.0 }, // 9 pixels normalized
      uRotationAngle: { value: 45.0 * (Math.PI / 180) }, // 45 degrees in radians
      uStepSize: { value: 1.0 / 1024.0 }, // 1 pixel normalized
      uDepositAmount: { value: 5.0 }, // Trail intensity
      uDecayFactor: { value: 0.9 }, // 90% retention per frame
      uDebugMode: { value: 0 }, // 0=trails, 1=particles, 2=both
    };

    // First initialize the agent simulation
    const numAgents = this.uniforms.uNumAgents.value;
    this.agentsRenderTargetA = createAgentRenderTarget(numAgents);
    this.agentsRenderTargetB = createAgentRenderTarget(numAgents);
    const initialAgentsTexture = this.initializeAgents();
    this.agentSimMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uAgentState: { value: initialAgentsTexture },
        uTrailMap: { value: null },
        uTime: { value: 0 },
        ...this.uniforms,
      },
      vertexShader: agentSimVert,
      fragmentShader: agentSimFrag,
    });
    this.agentSimScene = new THREE.Scene();
    const simQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.agentSimMaterial
    );
    this.agentSimScene.add(simQuad);

    // Initialize agentsRenderTargetA with initial particle data
    this.renderer.setRenderTarget(this.agentsRenderTargetA);
    this.agentSimMaterial.uniforms.uAgentState.value = initialAgentsTexture;
    this.renderer.render(this.agentSimScene, this.camera);
    this.renderer.setRenderTarget(null);

    // Initialize trail map
    this.trailRenderTargetA = createTrailRenderTarget(width, height);
    this.trailRenderTargetB = createTrailRenderTarget(width, height);
    this.trailRenderScene = new THREE.Scene();
    this.trailRenderMaterial = new THREE.ShaderMaterial({
      vertexShader: trailRenderVert,
      fragmentShader: trailRenderFrag,
      uniforms: {
        uAgentState: { value: null },
        ...this.uniforms,
      },
      blending: THREE.AdditiveBlending, // Particles add to trails
      depthTest: false,
      depthWrite: false,
    });
    const depositGeometry = new THREE.BufferGeometry();
    const indices = new Float32Array(numAgents);
    const positions = new Float32Array(numAgents * 3); // 3 components per vertex

    for (let i = 0; i < numAgents; i++) {
      indices[i] = i;
      // Dummy positions (actual positions calculated in vertex shader from texture)
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    depositGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    depositGeometry.setAttribute(
      "aAgentIndex",
      new THREE.BufferAttribute(indices, 1)
    );
    const trailMesh = new THREE.Points(
      depositGeometry,
      this.trailRenderMaterial
    );
    this.trailRenderScene.add(trailMesh);

    // Clear trail maps to black initially
    this.renderer.setRenderTarget(this.trailRenderTargetA);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.trailRenderTargetB);
    this.renderer.clear();
    this.renderer.setRenderTarget(null);

    // Initialize trail decay pass
    this.trailDecayScene = new THREE.Scene();
    this.trailDecayMaterial = new THREE.ShaderMaterial({
      vertexShader: trailDecayVert,
      fragmentShader: trailDecayFrag,
      uniforms: {
        uPreviousTrail: { value: null },
        uDecayFactor: { value: this.uniforms.uDecayFactor.value },
      },
    });
    const decayQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.trailDecayMaterial
    );
    this.trailDecayScene.add(decayQuad);

    // Create a fullscreen quad that fills the orthographic camera view
    const planeWidth = aspect > 1 ? aspect * 2 : 2;
    const planeHeight = aspect > 1 ? 2 : (1 / aspect) * 2;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // Create mesh and add to scene
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uAgentState: { value: this.agentsRenderTargetA.texture },
        uTrailMap: { value: this.trailRenderTargetA.texture },
        ...this.uniforms,
      },
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    scene.add(this.mesh);
  }

  initializeAgents() {
    const numAgents = this.uniforms.uNumAgents.value; // Number of active particles
    const textureSize = Math.ceil(Math.sqrt(numAgents)); // Texture dimensions

    // Allocate data for entire texture (textureSize × textureSize)
    // This may be larger than numAgents (e.g., 512 agents needs 23×23 = 529 texels)
    const data = new Float32Array(textureSize * textureSize * 4);

    // Initialize particles randomly within a circle
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.2; // Radius 0.5 fills the entire viewport

    for (let i = 0; i < numAgents; i++) {
      // Random angle for position
      const angle = Math.random() * Math.PI * 2;
      const r = radius * Math.sqrt(Math.random()); // sqrt for uniform density

      // Position (R, G channels)
      data[i * 4 + 0] = centerX + r * Math.cos(angle);
      data[i * 4 + 1] = centerY + r * Math.sin(angle);

      // Random heading direction (B channel)
      const randomDirection = Math.random(); // Random angle in [0,1] range
      data[i * 4 + 2] = randomDirection;

      // Reserved (A channel)
      data[i * 4 + 3] = 1.0;
    }

    // Create DataTexture from particle data
    const texture = new THREE.DataTexture(
      data,
      textureSize,
      textureSize,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    texture.needsUpdate = true;
    return texture;
  }

  agentSimulationStep(time: number) {
    this.agentSimMaterial.uniforms.uAgentState.value =
      this.agentsRenderTargetA.texture;
    this.agentSimMaterial.uniforms.uTrailMap.value =
      this.trailRenderTargetA.texture;
    this.agentSimMaterial.uniforms.uTime.value = time;

    this.renderer.setRenderTarget(this.agentsRenderTargetB);
    this.renderer.render(this.agentSimScene, this.camera);
    this.renderer.setRenderTarget(null);

    [this.agentsRenderTargetA, this.agentsRenderTargetB] = [
      this.agentsRenderTargetB,
      this.agentsRenderTargetA,
    ];
  }

  trailMapStep() {
    // Step 1: Apply decay to previous frame's trails
    this.trailDecayMaterial.uniforms.uPreviousTrail.value =
      this.trailRenderTargetA.texture;
    this.trailDecayMaterial.uniforms.uDecayFactor.value =
      this.uniforms.uDecayFactor.value;

    this.renderer.autoClear = false;
    this.renderer.setRenderTarget(this.trailRenderTargetB);
    this.renderer.render(this.trailDecayScene, this.camera);

    // Step 2: Render particles on top with additive blending
    this.trailRenderMaterial.uniforms.uAgentState.value =
      this.agentsRenderTargetA.texture;

    this.renderer.render(this.trailRenderScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = true;

    // Step 3: Swap buffers for next frame
    [this.trailRenderTargetA, this.trailRenderTargetB] = [
      this.trailRenderTargetB,
      this.trailRenderTargetA,
    ];
  }

  update(time: number) {
    this.agentSimulationStep(time);
    this.trailMapStep();

    // Update display with results of simulation
    this.renderer.setRenderTarget(null);
    this.material.uniforms.uAgentState.value = this.agentsRenderTargetA.texture;
    this.material.uniforms.uTrailMap.value = this.trailRenderTargetA.texture;
    this.material.uniforms.uDebugMode.value = this.uniforms.uDebugMode.value;
  }

  /**
   * Update geometry and resolution uniform when window is resized
   * This ensures the plane fills the viewport and circles remain perfectly round
   */
  resize() {
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;

    // Update resolution uniform for aspect ratio correction in shader
    this.uniforms.uResolution.value.set(
      canvas.clientWidth,
      canvas.clientHeight
    );

    // Calculate new dimensions
    const width = aspect > 1 ? aspect * 2 : 2;
    const height = aspect > 1 ? 2 : (1 / aspect) * 2;

    // Dispose old geometry and create new one
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(width, height);
  }

  /**
   * Clean up resources when switching examples
   */
  dispose() {
    this.agentSimMaterial.dispose();
    this.agentsRenderTargetA.dispose();
    this.agentsRenderTargetB.dispose();

    this.trailRenderMaterial.dispose();
    this.trailRenderTargetA.dispose();
    this.trailRenderTargetB.dispose();

    this.trailDecayMaterial.dispose();

    // Remove mesh from scene first
    this.mesh.parent?.remove(this.mesh);
    // Then dispose of resources
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
