import * as THREE from "three";
import vertexShader from "./shaders/display.vert";
import fragmentShader from "./shaders/display.frag";
import agentSimFrag from "./shaders/agentSim.frag";
import agentSimVert from "./shaders/agentSim.vert";
import trailRenderVert from "./shaders/trailMap.vert";
import trailRenderFrag from "./shaders/trailMap.frag";
import blurVert from "./shaders/blur.vert";
import blurFrag from "./shaders/blur.frag";
import copyVert from "./shaders/copy.vert";
import copyFrag from "./shaders/copy.frag";
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
    uDiffuseWeight: { value: number };
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

  // Copy pass (to copy A to B before particles)
  private copyScene: THREE.Scene;
  private copyMaterial: THREE.ShaderMaterial;

  // Blur + Decay pass (combined)
  private blurScene: THREE.Scene;
  private blurMaterial: THREE.ShaderMaterial;

  // Delta time tracking
  private lastTime: number = 0;

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
      max: Math.PI / 4,
      step: 0.01,
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
      max: Math.PI / 4,
      step: 0.01,
      // format: (value: number) => `${Math.round(value * (180 / Math.PI))}°`,
    },
    {
      name: "Step Size",
      property: "uStepSize",
      type: "slider",
      min: 0,
      max: 100,
      step: 0.1,
      // format: (value: number) => `${(value * 1024).toFixed(1)} px`,
    },
    {
      name: "Diffuse Weight",
      property: "uDiffuseWeight",
      type: "slider",
      min: 0.0,
      max: 1.0,
      step: 0.01,
    },
    {
      name: "Decay Factor",
      property: "uDecayFactor",
      type: "slider",
      min: 0.0,
      max: 1.0,
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
    {
      name: "Reset Simulation",
      property: "resetSimulation",
      type: "button",
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
      uNumAgents: { value: 250_000 }, // Texture size (e.g., 23 for 512 particles)
      uSensorAngle: { value: 22.5 * (Math.PI / 180) }, // 22.5 degrees in radians
      uSensorDistance: { value: 9.0 },
      uRotationAngle: { value: 45.0 * (Math.PI / 180) }, // 45 degrees in radians
      uStepSize: { value: 20.0 },
      uDepositAmount: { value: 5.0 }, // Trail intensity
      uDecayFactor: { value: 0.2 }, // Color retention per second (1.0=no decay, 0.0=instant)
      uDiffuseWeight: { value: 1.0 }, // Blur amount (0.0 = sharp, 1.0 = full blur)
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
        uDeltaTime: { value: 0.016 },
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
      blending: THREE.AdditiveBlending, // Use additive since we copy A to B first
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

    // Initialize copy pass (for copying A to B before particles)
    this.copyScene = new THREE.Scene();
    this.copyMaterial = new THREE.ShaderMaterial({
      vertexShader: copyVert,
      fragmentShader: copyFrag,
      uniforms: {
        uTexture: { value: null },
      },
    });
    const copyQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.copyMaterial
    );
    this.copyScene.add(copyQuad);

    // Initialize combined blur + decay pass
    this.blurScene = new THREE.Scene();
    this.blurMaterial = new THREE.ShaderMaterial({
      vertexShader: blurVert,
      fragmentShader: blurFrag,
      uniforms: {
        uTrailMap: { value: null },
        uResolution: { value: new THREE.Vector2(width, height) },
        uDecayFactor: { value: this.uniforms.uDecayFactor.value },
        uDiffuseWeight: { value: this.uniforms.uDiffuseWeight.value },
        uDeltaTime: { value: 0.016 }, // Initialize with ~60fps
      },
    });
    const blurQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.blurMaterial
    );
    this.blurScene.add(blurQuad);

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
    const radius = 0.1;

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

  agentSimulationStep(time: number, dt: number) {
    this.agentSimMaterial.uniforms.uAgentState.value =
      this.agentsRenderTargetA.texture;
    this.agentSimMaterial.uniforms.uTrailMap.value =
      this.trailRenderTargetA.texture;
    this.agentSimMaterial.uniforms.uTime.value = time;
    this.agentSimMaterial.uniforms.uDeltaTime.value = dt;

    this.renderer.setRenderTarget(this.agentsRenderTargetB);
    this.renderer.render(this.agentSimScene, this.camera);
    this.renderer.setRenderTarget(null);

    [this.agentsRenderTargetA, this.agentsRenderTargetB] = [
      this.agentsRenderTargetB,
      this.agentsRenderTargetA,
    ];
  }

  trailMapStep(deltaTime: number) {
    // Step 1: Copy A to B (so B has previous frame's trails)
    this.copyMaterial.uniforms.uTexture.value = this.trailRenderTargetA.texture;
    this.renderer.setRenderTarget(this.trailRenderTargetB);
    this.renderer.render(this.copyScene, this.camera);

    // Step 2: Deposit particles on top of B (additive blending)
    this.trailRenderMaterial.uniforms.uAgentState.value =
      this.agentsRenderTargetA.texture;
    this.renderer.autoClear = false; // Don't clear - we want to keep the copied trails
    this.renderer.render(this.trailRenderScene, this.camera);
    this.renderer.autoClear = true;

    // Step 3: Apply blur + decay to B, write to A
    this.blurMaterial.uniforms.uTrailMap.value =
      this.trailRenderTargetB.texture;
    this.blurMaterial.uniforms.uDecayFactor.value =
      this.uniforms.uDecayFactor.value;
    this.blurMaterial.uniforms.uDiffuseWeight.value =
      this.uniforms.uDiffuseWeight.value;
    this.blurMaterial.uniforms.uDeltaTime.value = deltaTime;

    this.renderer.setRenderTarget(this.trailRenderTargetA);
    this.renderer.render(this.blurScene, this.camera);
    this.renderer.setRenderTarget(null);

    // Ping-pong: A → B → A
    // Next frame will read from A again
  }

  update(time: number) {
    // Calculate delta time
    const deltaTime = this.lastTime === 0 ? 0.016 : time - this.lastTime;
    this.lastTime = time;

    this.agentSimulationStep(time, deltaTime);
    this.trailMapStep(deltaTime);

    // Update display with results of simulation
    this.renderer.setRenderTarget(null);
    this.material.uniforms.uAgentState.value = this.agentsRenderTargetA.texture;
    this.material.uniforms.uTrailMap.value = this.trailRenderTargetA.texture;
    this.material.uniforms.uDebugMode.value = this.uniforms.uDebugMode.value;
  }

  /**
   * Reset the simulation to initial state
   * Preserves user-configured control values
   */
  public resetSimulation() {
    // Dispose old agent texture to prevent memory leak
    const oldTexture = this.agentSimMaterial.uniforms.uAgentState.value;
    if (oldTexture) {
      oldTexture.dispose();
    }

    // Reinitialize agents with fresh random positions
    const newAgentsTexture = this.initializeAgents();
    this.agentSimMaterial.uniforms.uAgentState.value = newAgentsTexture;

    // Re-render the initial agent state to agentsRenderTargetA
    this.renderer.setRenderTarget(this.agentsRenderTargetA);
    this.renderer.render(this.agentSimScene, this.camera);
    this.renderer.setRenderTarget(null);

    // Clear both trail render targets to black
    this.renderer.setRenderTarget(this.trailRenderTargetA);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.trailRenderTargetB);
    this.renderer.clear();
    this.renderer.setRenderTarget(null);

    // Reset time tracking for delta time calculations
    this.lastTime = 0;
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

    // Update blur shader resolution uniforms
    this.blurMaterial.uniforms.uResolution.value.set(
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

    this.copyMaterial.dispose();
    this.blurMaterial.dispose();

    // Remove mesh from scene first
    this.mesh.parent?.remove(this.mesh);
    // Then dispose of resources
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
