/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PortfolioScene — the cinematic WebGL engine
 *
 *  One persistent scene drives the whole page:
 *   • GPU particle system that morphs: luminous field → typography →
 *     flowing cloud → semiconductor chip → connected electronic network
 *   • Procedural PBR chip assembly (substrate / copper IHS / silicon die /
 *     gold pins / SMD components) on a dark PCB ground with glowing traces
 *   • Scroll-synchronised cinematic camera path (keyframe tracks)
 *   • Postprocessing: bloom + cinematic pass (vignette / grain / chroma)
 *
 *  Quality tiers adapt particle count, DPR, postprocessing and shadows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gsap } from "@/lib/gsap";
import type { QualityTier } from "@/store/experience";

/* ────────────────────────────── configuration ────────────────────────────── */

const TIER_CONFIG: Record<
  QualityTier,
  {
    particles: number;
    dpr: number;
    bloom: boolean;
    chroma: boolean;
    shadows: boolean;
    traces: number;
    shadowMap: number;
  }
> = {
  high: { particles: 12000, dpr: 2, bloom: true, chroma: true, shadows: true, traces: 26, shadowMap: 1024 },
  medium: { particles: 9000, dpr: 1.5, bloom: true, chroma: false, shadows: true, traces: 18, shadowMap: 512 },
  low: { particles: 4500, dpr: 1.25, bloom: false, chroma: false, shadows: false, traces: 12, shadowMap: 0 },
};

interface TrackKey {
  at: number;
  pos: [number, number, number];
  look: [number, number, number];
  chipW: number;
  netW: number;
  traceReveal: number;
  fog: number;
  bloom: number;
  /** global particle opacity multiplier so DOM sections stay readable */
  dim: number;
}

/** Scroll-synchronised camera & scene-state keyframes (page progress 0..1) */
const TRACKS: TrackKey[] = [
  { at: 0.0,  pos: [0, 2.0, 7.4],    look: [0, 0.5, 0],     chipW: 1,    netW: 0,    traceReveal: 0.12, fog: 0.055, bloom: 0.42, dim: 1 },
  { at: 0.15, pos: [2.9, 1.6, 5.6],  look: [-1.5, 0.55, 0], chipW: 1,    netW: 0,    traceReveal: 0.4,  fog: 0.05,  bloom: 0.38, dim: 0.42 },
  { at: 0.3,  pos: [-3.6, 1.7, 4.6], look: [0, 0.7, 0],     chipW: 0.5,  netW: 0.5,  traceReveal: 0.55, fog: 0.048, bloom: 0.4,  dim: 0.45 },
  { at: 0.44, pos: [-5.4, 2.7, 1.8], look: [-0.8, 1.1, -1], chipW: 0.18, netW: 0.82, traceReveal: 0.68, fog: 0.044, bloom: 0.42, dim: 0.38 },
  { at: 0.58, pos: [5.0, 3.1, -1.2], look: [0, 0.9, 0],     chipW: 0.15, netW: 0.85, traceReveal: 0.94, fog: 0.044, bloom: 0.42, dim: 0.38 },
  { at: 0.72, pos: [0, 4.4, 7.0],    look: [0, 0.5, 0],     chipW: 0.35, netW: 0.65, traceReveal: 1,    fog: 0.05,  bloom: 0.4,  dim: 0.35 },
  { at: 0.85, pos: [-2.4, 2.0, 6.8], look: [0, 0.6, 0],     chipW: 0.75, netW: 0.25, traceReveal: 1,    fog: 0.052, bloom: 0.38, dim: 0.5 },
  { at: 1.0,  pos: [0, 1.3, 8.8],    look: [0, 0.6, 0],     chipW: 1,    netW: 0,    traceReveal: 1,    fog: 0.05,  bloom: 0.44, dim: 0.65 },
];

/* ─────────────────────────────── shaders ─────────────────────────────────── */

const PARTICLE_VERT = /* glsl */ `
attribute vec3 aField;
attribute vec3 aText;
attribute vec3 aScatter;
attribute vec3 aChip;
attribute vec3 aNetwork;
attribute vec4 aRand;
uniform float uTime;
uniform float uFieldW;
uniform float uTextW;
uniform float uScatterW;
uniform float uChipW;
uniform float uNetworkW;
uniform float uSize;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uCalm;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float maxW = max(uFieldW, max(uTextW, max(uScatterW, max(uChipW, uNetworkW))));
  float midness = clamp(1.0 - maxW, 0.0, 1.0);

  vec3 pos =
    aField    * uFieldW +
    aText     * uTextW +
    aScatter  * uScatterW +
    aChip     * uChipW +
    aNetwork  * uNetworkW;

  float amp = 0.42 * uFieldW + 0.55 * uScatterW + 0.045 * uTextW + 0.035 * uChipW + 0.16 * uNetworkW;
  amp *= uCalm;
  float t = uTime;
  pos.x += sin(t * 0.55 + aRand.x * 23.0 + pos.y * 1.4) * amp * (0.5 + aRand.y);
  pos.y += sin(t * 0.48 + aRand.y * 29.0 + pos.x * 1.1) * amp * 0.8 * (0.5 + aRand.z);
  pos.z += cos(t * 0.52 + aRand.z * 31.0 + pos.x * 0.9) * amp * (0.5 + aRand.x);

  // Swarm displacement while morphing between states (per-particle randomness)
  vec3 dir = normalize(vec3(aRand.x, aRand.y * 0.6, aRand.z) - 0.5);
  pos += dir * midness * (0.4 + aRand.w * 1.1);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float sz = uSize * (0.5 + aRand.x * 0.9) * (1.0 + step(0.94, aRand.z) * 1.5);
  gl_PointSize = sz * uPixelRatio * (180.0 / max(0.001, -mv.z));
  gl_Position = projectionMatrix * mv;

  vec3 deep = vec3(0.44, 0.23, 0.06);
  vec3 gold = vec3(1.0, 0.72, 0.32);
  vColor = mix(deep, gold, aRand.y);
  if (aRand.z > 0.94) vColor = vec3(1.0, 0.93, 0.78);

  float glowBoost = uTextW * 0.3 + uChipW * -0.16 + midness * 0.2 + uNetworkW * 0.12;
  vAlpha = uOpacity * (0.72 + 0.28 * sin(t * 1.4 + aRand.w * 40.0)) * max(0.05, 0.38 + glowBoost);
}
`;

const PARTICLE_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.08, d);
  a += smoothstep(0.14, 0.0, d) * 0.85;
  if (a < 0.02) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

const TRACE_VERT = /* glsl */ `
attribute vec3 aLine; // x: stagger 0..1, y: speed rand, z: phase rand
varying float vT;
varying vec3 vLine;
void main() {
  vT = uv.x;
  vLine = aLine;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const TRACE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uReveal;
varying float vT;
varying vec3 vLine;
void main() {
  float lp = clamp((uReveal - vLine.x * 0.45) / 0.55, 0.0, 1.0); // per-line progress
  float visible = step(vT, lp);
  float frontGlow = exp(-(lp - vT) * 22.0) * visible * 2.2;
  float pulse = fract(uTime * (0.06 + vLine.y * 0.07) + vLine.z);
  float pulseGlow = exp(-abs(vT - pulse) * 26.0) * visible * 1.5;
  float base = 0.3 * visible;
  float i = base + frontGlow + pulseGlow;
  if (i < 0.02) discard;
  vec3 col = mix(vec3(0.85, 0.52, 0.16), vec3(1.0, 0.82, 0.48), clamp(i * 0.5, 0.0, 1.0));
  gl_FragColor = vec4(col, clamp(i, 0.0, 1.0));
}
`;

const GLOWDOT_VERT = /* glsl */ `
attribute float aRand;
uniform float uPixelRatio;
varying float vRand;
void main() {
  vRand = aRand;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 10.0 * uPixelRatio * (140.0 / max(0.001, -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;

const GLOWDOT_FRAG = /* glsl */ `
uniform float uTime;
uniform float uReveal;
varying float vRand;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.04, d);
  float lp = clamp((uReveal - vRand * 0.45) / 0.55, 0.0, 1.0);
  float flicker = 0.65 + 0.35 * sin(uTime * 2.2 + vRand * 50.0);
  float alpha = a * lp * flicker;
  if (alpha < 0.02) discard;
  vec3 col = mix(vec3(0.9, 0.55, 0.18), vec3(1.0, 0.86, 0.55), flicker * 0.6);
  gl_FragColor = vec4(col, alpha);
}
`;

/** Final cinematic pass: vignette + film grain + subtle chromatic aberration */
const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uChroma: { value: 0.35 },
    uGrain: { value: 0.045 },
    uVignette: { value: 0.72 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uChroma;
    uniform float uGrain;
    uniform float uVignette;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      vec2 c = uv - 0.5;
      float d = length(c);
      float ca = uChroma * d * d * 0.012;
      vec4 col;
      col.r = texture2D(tDiffuse, uv + c * ca).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - c * ca).b;
      col.a = 1.0;
      float vig = smoothstep(0.95, 0.3, d);
      col.rgb *= mix(1.0, vig, uVignette);
      float g = fract(sin(dot(uv * uResolution + vec2(uTime * 43.7, uTime * 17.3), vec2(12.9898, 78.233))) * 43758.5453);
      col.rgb += (g - 0.5) * uGrain;
      gl_FragColor = col;
    }
  `,
};

/* ─────────────────────────────── engine ──────────────────────────────────── */

interface IntroState {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fieldW: number;
  textW: number;
  scatterW: number;
  chipW: number;
  networkW: number;
  traceReveal: number;
}

export class PortfolioScene {
  private canvas: HTMLCanvasElement;
  private tier: QualityTier;
  private reduced: boolean;
  private cfg: (typeof TIER_CONFIG)[QualityTier];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private cinematicPass: ShaderPass | null = null;

  private particleUniforms!: {
    uTime: { value: number };
    uFieldW: { value: number };
    uTextW: { value: number };
    uScatterW: { value: number };
    uChipW: { value: number };
    uNetworkW: { value: number };
    uSize: { value: number };
    uPixelRatio: { value: number };
    uOpacity: { value: number };
    uCalm: { value: number };
  };

  private traceUniforms!: { uTime: { value: number }; uReveal: { value: number } };
  private viaUniforms!: { uTime: { value: number }; uReveal: { value: number }; uPixelRatio: { value: number } };
  private dieMaterial!: THREE.MeshStandardMaterial;
  private pulseLight!: THREE.PointLight;
  private networkLines!: THREE.LineSegments;
  private ihsMaterial!: THREE.MeshStandardMaterial;
  private groundMaterial!: THREE.MeshStandardMaterial;
  /** die glow multiplier (intro "activation" tween drives this) */
  private dieActivation = 0.18;
  /** low tier has no bloom — cap die brightness harder */
  private dieTierFactor = 1;
  /** pulse light multiplier (intro "activation" tween drives this) */
  private pulseBoost = 0.25;

  private intro: IntroState;
  private introTl: gsap.core.Timeline | null = null;
  private scrollProgress = 0;
  private pointer = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private lastTime = 0;
  private elapsed = 0;
  private raf = 0;
  private running = true;
  private disposed = false;

  /** returns page progress 0..1 (injected by React layer) */
  scrollProvider: () => number = () => 0;

  constructor(canvas: HTMLCanvasElement, tier: QualityTier, reduced: boolean) {
    this.canvas = canvas;
    this.tier = tier;
    this.reduced = reduced;
    this.cfg = TIER_CONFIG[tier];
    this.dieTierFactor = tier === "low" ? 0.65 : 1;

    this.intro = {
      pos: new THREE.Vector3(0, 2.5, 11.0),
      look: new THREE.Vector3(0, 2.3, 0),
      fieldW: 1,
      textW: 0,
      scatterW: 0,
      chipW: 0,
      networkW: 0,
      traceReveal: 0,
    };

    this.initRenderer();
    this.initScene();
  }

  /* ── setup ─────────────────────────────────────────────────────────────── */

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.tier !== "low",
      alpha: false,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, this.cfg.dpr);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    if (this.cfg.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }

  private initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050403);
    scene.fog = new THREE.FogExp2(0x050403, 0.055);
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    this.camera.position.copy(this.intro.pos);

    // Environment for physically-accurate reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.95;
    pmrem.dispose();

    // Lighting rig — warm cinematic key + ember rim
    const key = new THREE.DirectionalLight(0xffd9a0, 2.4);
    key.position.set(6, 9, 4);
    if (this.cfg.shadows) {
      key.castShadow = true;
      key.shadow.mapSize.set(this.cfg.shadowMap, this.cfg.shadowMap);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 30;
      key.shadow.camera.left = -6;
      key.shadow.camera.right = 6;
      key.shadow.camera.top = 6;
      key.shadow.camera.bottom = -6;
      key.shadow.bias = -0.0004;
      key.shadow.radius = 6;
    }
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xff9a3c, 1.7);
    rim.position.set(-7, 4, -6);
    scene.add(rim);

    const hemi = new THREE.HemisphereLight(0x3a2f26, 0x0b0a09, 0.55);
    scene.add(hemi);

    this.pulseLight = new THREE.PointLight(0xffab4d, 0, 14, 1.6);
    this.pulseLight.position.set(2.4, 1.4, 2.4);
    scene.add(this.pulseLight);

    // Ground PCB plane (procedural — receives the chip)
    this.groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x14110e,
      roughness: 0.62,
      metalness: 0.22,
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 72), this.groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = this.cfg.shadows;
    scene.add(ground);

    // Chip assembly
    this.buildChip();
    // Glow traces + via nodes on the ground
    this.buildTraces();
    // Network lattice (About decomposition state)
    this.buildNetworkLines();
    // Particle system
    this.buildParticles();

    // Postprocessing
    if (this.cfg.bloom) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(scene, this.camera));
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.36,
        0.5,
        0.88
      );
      this.composer.addPass(this.bloomPass);
      this.cinematicPass = new ShaderPass(CinematicShader);
      this.cinematicPass.uniforms.uChroma.value = this.cfg.chroma ? 0.4 : 0.0;
      this.cinematicPass.uniforms.uGrain.value = this.cfg.chroma ? 0.05 : 0.03;
      this.composer.addPass(this.cinematicPass);
    }
  }

  private chipTextures: THREE.Texture[] = [];

  private buildChip() {
    const group = new THREE.Group();
    const castShadow = this.cfg.shadows;

    // Substrate — dark PCB slab
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x181410,
      roughness: 0.5,
      metalness: 0.25,
    });
    const substrate = new THREE.Mesh(
      new RoundedBoxGeometry(2.3, 0.16, 2.3, 3, 0.03),
      substrateMat
    );
    substrate.position.y = 0.08;
    substrate.castShadow = castShadow;
    substrate.receiveShadow = castShadow;
    group.add(substrate);

    // Copper IHS — brushed metal lid
    this.ihsMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9a05c,
      roughness: 0.24,
      metalness: 0.9,
      envMapIntensity: 2.2,
    });
    const ihs = new THREE.Mesh(
      new RoundedBoxGeometry(1.5, 0.14, 1.5, 4, 0.045),
      this.ihsMaterial
    );
    ihs.position.y = 0.235;
    ihs.castShadow = castShadow;
    group.add(ihs);

    // Silicon die — emissive heart of the package
    this.dieMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1712,
      roughness: 0.34,
      metalness: 0.45,
      emissive: 0xffb454,
      emissiveIntensity: 0.15,
      envMapIntensity: 0.9,
    });
    const die = new THREE.Mesh(
      new RoundedBoxGeometry(0.7, 0.045, 0.7, 2, 0.015),
      this.dieMaterial
    );
    die.position.y = 0.325;
    group.add(die);

    // Gold perimeter pins (instanced)
    const pinGeo = new RoundedBoxGeometry(0.05, 0.026, 0.15, 1, 0.012);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xd8a850,
      roughness: 0.28,
      metalness: 1.0,
      envMapIntensity: 1.4,
    });
    const sideCount = 22;
    const pins = new THREE.InstancedMesh(pinGeo, pinMat, sideCount * 4);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3(1, 1, 1);
    let idx = 0;
    const half = 1.2;
    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < sideCount; i++) {
        const t = (i / (sideCount - 1) - 0.5) * 2.0;
        if (s === 0) {
          pos.set(t * half, 0.03, half + 0.06);
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
        } else if (s === 1) {
          pos.set(t * half, 0.03, -half - 0.06);
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
        } else if (s === 2) {
          pos.set(half + 0.06, 0.03, t * half);
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        } else {
          pos.set(-half - 0.06, 0.03, t * half);
          q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        }
        m.compose(pos, q, scl);
        pins.setMatrixAt(idx++, m);
      }
    }
    pins.castShadow = castShadow;
    group.add(pins);

    // SMD passives scattered on the substrate
    const smdGeo = new RoundedBoxGeometry(0.11, 0.05, 0.06, 1, 0.01);
    const smdMat = new THREE.MeshStandardMaterial({
      color: 0x201c18,
      roughness: 0.42,
      metalness: 0.35,
    });
    const smdCount = 34;
    const smd = new THREE.InstancedMesh(smdGeo, smdMat, smdCount);
    for (let i = 0; i < smdCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 0.88 + Math.random() * 0.22;
      pos.set(Math.cos(ang) * rad, 0.19, Math.sin(ang) * rad);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI);
      m.compose(pos, q, scl);
      smd.setMatrixAt(i, m);
    }
    group.add(smd);

    this.scene.add(group);
  }

  /** Manhattan-ish glowing traces radiating from beneath the chip */
  private buildTraces() {
    const mats: THREE.BufferGeometry[] = [];
    const viaPoints: THREE.Vector3[] = [];
    const viaRand: number[] = [];
    const count = this.cfg.traces;

    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const pts: THREE.Vector3[] = [];
      let radius = 1.45;
      let a = ang;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0.021, Math.sin(a) * radius));
      const segs = 3 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs; s++) {
        radius += 0.9 + Math.random() * 1.7;
        a += (Math.random() - 0.5) * 0.9;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0.021, Math.sin(a) * radius));
      }
      const end = pts[pts.length - 1];
      viaPoints.push(end.clone());
      viaRand.push(Math.random());

      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.06);
      const tube = new THREE.TubeGeometry(curve, 48, 0.0075, 5, false);
      const n = tube.attributes.position.count;
      const lineAttr = new Float32Array(n * 3);
      const stagger = Math.random();
      const speed = Math.random();
      const phase = Math.random();
      for (let v = 0; v < n; v++) {
        lineAttr[v * 3] = stagger;
        lineAttr[v * 3 + 1] = speed;
        lineAttr[v * 3 + 2] = phase;
      }
      tube.setAttribute("aLine", new THREE.BufferAttribute(lineAttr, 3));
      mats.push(tube);
    }

    const merged = mergeGeometries(mats, false);
    mats.forEach((g) => g.dispose());
    if (!merged) return;

    this.traceUniforms = {
      uTime: { value: 0 },
      uReveal: { value: 0 },
    };
    const traceMat = new THREE.ShaderMaterial({
      vertexShader: TRACE_VERT,
      fragmentShader: TRACE_FRAG,
      uniforms: this.traceUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.scene.add(new THREE.Mesh(merged, traceMat));

    // Via nodes at trace endpoints
    const viaGeo = new THREE.BufferGeometry();
    viaGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        viaPoints.flatMap((p) => [p.x, p.y, p.z]),
        3
      )
    );
    viaGeo.setAttribute(
      "aRand",
      new THREE.Float32BufferAttribute(viaRand, 1)
    );
    this.viaUniforms = {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, this.cfg.dpr) },
    };
    const viaMat = new THREE.ShaderMaterial({
      vertexShader: GLOWDOT_VERT,
      fragmentShader: GLOWDOT_FRAG,
      uniforms: this.viaUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.scene.add(new THREE.Points(viaGeo, viaMat));
  }

  /** Elevated lattice of nodes + faint connections (the "network" state) */
  private buildNetworkLines() {
    const nodeCount = 30;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 1.6 + Math.random() * 3.4;
      const y = 1.2 + Math.random() * 3.4;
      nodes.push(new THREE.Vector3(Math.cos(ang) * rad, y, Math.sin(ang) * rad * 0.8));
    }

    const segs: number[] = [];
    nodes.forEach((n, i) => {
      const others = nodes
        .map((o, j) => ({ j, d: n.distanceTo(o) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      others.forEach(({ j }) => {
        segs.push(n.x, n.y, n.z, nodes[j].x, nodes[j].y, nodes[j].z);
      });
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0xe8a33d,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.networkLines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.networkLines);

    this.networkNodes = nodes;
  }

  private networkNodes: THREE.Vector3[] = [];

  /* ── particles ─────────────────────────────────────────────────────────── */

  private buildParticles() {
    const count = this.cfg.particles;
    const pr = Math.min(window.devicePixelRatio || 1, this.cfg.dpr);

    this.particleUniforms = {
      uTime: { value: 0 },
      uFieldW: { value: this.reduced ? 0 : 1 },
      uTextW: { value: 0 },
      uScatterW: { value: 0 },
      uChipW: { value: this.reduced ? 1 : 0 },
      uNetworkW: { value: 0 },
      uSize: { value: this.tier === "low" ? 1.0 : 0.85 },
      uPixelRatio: { value: pr },
      uOpacity: { value: 0 },
      uCalm: { value: this.reduced ? 0.18 : 1 },
    };

    const geo = new THREE.BufferGeometry();
    const aField = new Float32Array(count * 3);
    const aText = new Float32Array(count * 3);
    const aScatter = new Float32Array(count * 3);
    const aChip = new Float32Array(count * 3);
    const aNetwork = new Float32Array(count * 3);
    const aRand = new Float32Array(count * 4);

    // Luminous field — deep shell around the origin
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 5.5 + Math.random() * 8;
      const y = -1 + Math.random() * 8;
      aField[i * 3] = Math.cos(ang) * rad;
      aField[i * 3 + 1] = y;
      aField[i * 3 + 2] = Math.sin(ang) * rad;

      // Scatter — turbulent sphere
      const sang = Math.random() * Math.PI * 2;
      const srad = 3 + Math.random() * 5.5;
      aScatter[i * 3] = Math.cos(sang) * srad;
      aScatter[i * 3 + 1] = 2.2 + (Math.random() - 0.5) * srad;
      aScatter[i * 3 + 2] = Math.sin(sang) * srad * 0.7;

      // Random seeds
      aRand[i * 4] = Math.random();
      aRand[i * 4 + 1] = Math.random();
      aRand[i * 4 + 2] = Math.random();
      aRand[i * 4 + 3] = Math.random();
    }

    this.aText = aText;
    this.aChip = aChip;
    this.aNetwork = aNetwork;
    this.count = count;
    this.geoRef = geo;
    // Text & chip & network targets are filled during load() — set positions
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aField", new THREE.BufferAttribute(aField, 3));
    geo.setAttribute("aText", new THREE.BufferAttribute(aText, 3));
    geo.setAttribute("aScatter", new THREE.BufferAttribute(aScatter, 3));
    geo.setAttribute("aChip", new THREE.BufferAttribute(aChip, 3));
    geo.setAttribute("aNetwork", new THREE.BufferAttribute(aNetwork, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 4));

    const mat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      uniforms: this.particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    this.scene.add(points);
  }

  private aText!: Float32Array;
  private aChip!: Float32Array;
  private aNetwork!: Float32Array;
  private count = 0;
  private geoRef!: THREE.BufferGeometry;
  private textTargets: [number, number, number][] = [];
  private chipTargets: [number, number, number][] = [];

  /** Sample typography pixels into 3D targets (called once fonts settle) */
  private sampleTextTargets() {
    const w = 1600;
    const h = 560;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 200px Sora, "Arial Black", Arial, sans-serif`;
    ctx.fillText("LOKESH", w / 2, h * 0.27);
    ctx.fillText("NEDUNURI", w / 2, h * 0.73);

    const data = ctx.getImageData(0, 0, w, h).data;
    const pts: [number, number][] = [];
    const step = 3;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 120) pts.push([x, y]);
      }
    }
    if (pts.length === 0) return;

    const k = 11.8 / w; // world units per pixel — full block ≈ 11.8 wide
    const centerY = 2.35;
    this.textTargets = pts.map(([x, y]) => [
      (x - w / 2) * k + (Math.random() - 0.5) * 0.012,
      centerY + (h / 2 - y) * k + (Math.random() - 0.5) * 0.012,
      (Math.random() - 0.5) * 0.42,
    ]);
  }

  private fillTargets() {
    const { count } = this;

    // Typography targets
    if (this.textTargets.length > 0) {
      for (let i = 0; i < count; i++) {
        const p = this.textTargets[i % this.textTargets.length];
        this.aText[i * 3] = p[0];
        this.aText[i * 3 + 1] = p[1];
        this.aText[i * 3 + 2] = p[2];
      }
    } else {
      // Degraded fallback: flat banner of points
      for (let i = 0; i < count; i++) {
        this.aText[i * 3] = (Math.random() - 0.5) * 10;
        this.aText[i * 3 + 1] = 2 + (Math.random() - 0.5) * 2.5;
        this.aText[i * 3 + 2] = 0;
      }
    }

    // Chip surface targets
    const ct = this.chipTargets;
    for (let i = 0; i < count; i++) {
      const p = ct[Math.floor(Math.random() * ct.length)];
      this.aChip[i * 3] = p[0];
      this.aChip[i * 3 + 1] = p[1];
      this.aChip[i * 3 + 2] = p[2];
    }

    // Network targets — node clusters + flow along connections
    const nodes = this.networkNodes;
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.55) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        this.aNetwork[i * 3] = n.x + (Math.random() - 0.5) * 0.55;
        this.aNetwork[i * 3 + 1] = n.y + (Math.random() - 0.5) * 0.55;
        this.aNetwork[i * 3 + 2] = n.z + (Math.random() - 0.5) * 0.55;
      } else {
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        const b = nodes[Math.floor(Math.random() * nodes.length)];
        const t = Math.random();
        this.aNetwork[i * 3] = a.x + (b.x - a.x) * t;
        this.aNetwork[i * 3 + 1] = a.y + (b.y - a.y) * t;
        this.aNetwork[i * 3 + 2] = a.z + (b.z - a.z) * t;
      }
    }

    (this.geoRef.attributes.aText as THREE.BufferAttribute).needsUpdate = true;
    (this.geoRef.attributes.aChip as THREE.BufferAttribute).needsUpdate = true;
    (this.geoRef.attributes.aNetwork as THREE.BufferAttribute).needsUpdate = true;
  }

  /** Precompute chip-surface sample points */
  private buildChipTargets() {
    const ct: [number, number, number][] = [];
    // IHS top face
    for (let i = 0; i < 900; i++) {
      ct.push([
        (Math.random() - 0.5) * 1.44,
        0.312 + Math.random() * 0.008,
        (Math.random() - 0.5) * 1.44,
      ]);
    }
    // Die cluster
    for (let i = 0; i < 380; i++) {
      ct.push([
        (Math.random() - 0.5) * 0.66,
        0.352 + Math.random() * 0.01,
        (Math.random() - 0.5) * 0.66,
      ]);
    }
    // Pins
    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < 22; i++) {
        const t = (i / 21 - 0.5) * 2.0;
        if (s === 0) ct.push([t * 1.2, 0.035, 1.26]);
        else if (s === 1) ct.push([t * 1.2, 0.035, -1.26]);
        else if (s === 2) ct.push([1.26, 0.035, t * 1.2]);
        else ct.push([-1.26, 0.035, t * 1.2]);
      }
    }
    // IHS side walls
    for (let i = 0; i < 240; i++) {
      const side = Math.floor(Math.random() * 4);
      const t = (Math.random() - 0.5) * 1.5;
      const e = 0.75;
      if (side === 0) ct.push([t, 0.18 + Math.random() * 0.1, e]);
      else if (side === 1) ct.push([t, 0.18 + Math.random() * 0.1, -e]);
      else if (side === 2) ct.push([e, 0.18 + Math.random() * 0.1, t]);
      else ct.push([-e, 0.18 + Math.random() * 0.1, t]);
    }
    // Halo above the package (kept minimal — no fireball)
    for (let i = 0; i < 24; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 0.55 + Math.random() * 0.35;
      ct.push([Math.cos(ang) * rad, 0.4 + Math.random() * 0.3, Math.sin(ang) * rad]);
    }
    this.chipTargets = ct;
  }

  /* ── asset loading ─────────────────────────────────────────────────────── */

  async load(onProgress?: (v: number) => void): Promise<void> {
    const report = (v: number) => onProgress?.(Math.min(1, Math.max(0, v)));

    // Texture maps for PBR materials (die / brushed copper / pcb substrate)
    const loader = new THREE.TextureLoader();
    const texJobs: Array<{ url: string; apply: (t: THREE.Texture) => void }> = [
      {
        url: "/assets/textures/silicon-die.webp",
        apply: (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          this.dieMaterial.map = t;
          this.dieMaterial.emissiveMap = t;
          this.dieMaterial.emissiveIntensity = 0.55;
          this.dieMaterial.needsUpdate = true;
        },
      },
      {
        url: "/assets/textures/brushed-copper.webp",
        apply: (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          this.ihsMaterial.map = t;
          this.ihsMaterial.color.set(0xcfa070);
          this.ihsMaterial.needsUpdate = true;
        },
      },
      {
        url: "/assets/textures/pcb-substrate.webp",
        apply: (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(10, 10);
          t.anisotropy = 8;
          this.groundMaterial.map = t;
          this.groundMaterial.color.set(0x8a7a68);
          this.groundMaterial.needsUpdate = true;
        },
      },
    ];

    let done = 0;
    await Promise.all(
      texJobs.map(
        (job) =>
          new Promise<void>((resolve) => {
            loader.load(
              job.url,
              (t) => {
                job.apply(t);
                this.chipTextures.push(t);
                done++;
                report(0.15 + 0.6 * (done / texJobs.length));
                resolve();
              },
              undefined,
              () => {
                // Texture missing — degrade gracefully with plain materials
                done++;
                report(0.15 + 0.6 * (done / texJobs.length));
                resolve();
              }
            );
          })
      )
    );

    // Wait briefly for display fonts so typography sampling matches the DOM
    try {
      if (typeof document !== "undefined" && (document as Document).fonts) {
        await Promise.race([
          Promise.all([
            (document as FontFaceSource).fonts.load('800 200px "Sora"'),
            (document as FontFaceSource).fonts.ready,
          ]),
          new Promise((r) => setTimeout(r, 1400)),
        ]);
      }
    } catch {
      /* font API unavailable — sampling falls back to Arial */
    }
    report(0.85);

    this.buildChipTargets();
    this.sampleTextTargets();
    this.fillTargets();
    report(1);
  }

  /* ── intro timeline ────────────────────────────────────────────────────── */

  startIntro(onDone: () => void) {
    if (this.reduced) {
      // Jump straight to the settled hero state
      this.intro.fieldW = 0;
      this.intro.chipW = 1;
      this.intro.traceReveal = 0.12;
      this.intro.pos.set(0, 2.0, 7.4);
      this.intro.look.set(0, 0.5, 0);
      this.particleUniforms.uOpacity.value = 1;
      onDone();
      return;
    }

    const I = this.intro;
    const tl = gsap.timeline({ onComplete: onDone });
    this.introTl = tl;

    // 1. Mysterious luminous field — fade in, slow drift
    tl.to(this.particleUniforms.uOpacity, { value: 1, duration: 1.6, ease: "sine.out" }, 0);

    // 2. Particles converge into LOKESH NEDUNURI
    tl.to(I, { textW: 1, fieldW: 0, duration: 2.4, ease: "power3.inOut" }, 1.7);
    tl.to(I.pos, { x: 0, y: 2.3, z: 9.0, duration: 3.4, ease: "sine.inOut" }, 0.6);
    tl.to(I.look, { y: 2.3, duration: 2.4, ease: "sine.inOut" }, 0.6);

    // 3. Hold + shimmer (built into shader), then dissolve into flowing cloud
    tl.to(I, { scatterW: 1, textW: 0, duration: 1.5, ease: "power2.inOut" }, 4.9);
    tl.to(I.pos, { y: 2.0, z: 8.5, duration: 1.5, ease: "sine.inOut" }, 4.9);

    // 4. Assemble the semiconductor chip
    tl.to(I, { chipW: 1, scatterW: 0, duration: 2.3, ease: "power3.inOut" }, 6.4);
    tl.to(I.look, { y: 0.5, duration: 2.3, ease: "sine.inOut" }, 6.4);
    tl.to(I.pos, { y: 2.0, z: 7.4, duration: 2.3, ease: "sine.inOut" }, 6.4);

    // 5. Processor activation — traces energise, pulses begin
    tl.to(I, { traceReveal: 0.12, duration: 1.8, ease: "sine.inOut" }, 8.2);
    tl.to(this, { dieActivation: 0.9, duration: 0.5, ease: "sine.in" }, 8.4);
    tl.to(this, { dieActivation: 0.5, duration: 0.9, ease: "sine.out" }, 8.9);
    tl.to(this, { pulseBoost: 1, duration: 1.2, ease: "sine.out" }, 8.5);

    // 6. Total ≈ 10s → onDone fires, nav & hero copy appear
  }

  /* ── runtime ───────────────────────────────────────────────────────────── */

  setScrollProgress(p: number) {
    this.scrollProgress = THREE.MathUtils.clamp(p, 0, 1);
  }

  setPointer(nx: number, ny: number) {
    this.pointer.set(nx, ny);
  }

  private tmpPos = new THREE.Vector3();
  private tmpLook = new THREE.Vector3();

  /** Pull the camera back on narrow screens so the chip never swamps the frame */
  private applyDolly(pos: THREE.Vector3, look: THREE.Vector3) {
    const aspect = this.camera.aspect;
    const f = aspect < 0.75 ? 1.55 : aspect < 1.1 ? 1.28 : aspect < 1.5 ? 1.06 : 1;
    if (f === 1) return;
    pos.sub(look).multiplyScalar(f).add(look);
  }

  private applyScrollState() {
    const p = this.scrollProgress;
    const tracks = TRACKS;
    let i = 0;
    while (i < tracks.length - 2 && p >= tracks[i + 1].at) i++;
    const a = tracks[i];
    const b = tracks[Math.min(i + 1, tracks.length - 1)];
    const span = Math.max(1e-5, b.at - a.at);
    const local = THREE.MathUtils.clamp((p - a.at) / span, 0, 1);
    const e = local * local * (3 - 2 * local); // smoothstep

    this.tmpPos.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], e),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], e),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], e)
    );
    this.tmpLook.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], e),
      THREE.MathUtils.lerp(a.look[1], b.look[1], e),
      THREE.MathUtils.lerp(a.look[2], b.look[2], e)
    );

    const chipW = THREE.MathUtils.lerp(a.chipW, b.chipW, e);
    const netW = THREE.MathUtils.lerp(a.netW, b.netW, e);
    const reveal = THREE.MathUtils.lerp(a.traceReveal, b.traceReveal, e);
    const fog = THREE.MathUtils.lerp(a.fog, b.fog, e);
    const bloom = THREE.MathUtils.lerp(a.bloom, b.bloom, e);
    const dim = THREE.MathUtils.lerp(a.dim, b.dim, e);

    const u = this.particleUniforms;
    u.uChipW.value = chipW;
    u.uNetworkW.value = netW;
    u.uFieldW.value = 0;
    u.uTextW.value = 0;
    u.uScatterW.value = 0;
    u.uOpacity.value = dim;

    if (this.traceUniforms) this.traceUniforms.uReveal.value = reveal;
    if (this.viaUniforms) this.viaUniforms.uReveal.value = reveal;
    (this.scene.fog as THREE.FogExp2).density = fog;
    if (this.bloomPass) this.bloomPass.strength = bloom;
    (this.networkLines.material as THREE.LineBasicMaterial).opacity = netW * 0.34;
  }

  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
    if (!this.running) return;

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.elapsed += dt;
    const t = this.elapsed;

    // Scroll progress is polled every frame so Lenis smoothing stays in sync
    this.scrollProgress = THREE.MathUtils.clamp(this.scrollProvider(), 0, 1);

    const u = this.particleUniforms;
    u.uTime.value = t;
    if (this.traceUniforms) this.traceUniforms.uTime.value = t;
    if (this.viaUniforms) this.viaUniforms.uTime.value = t;
    if (this.cinematicPass) this.cinematicPass.uniforms.uTime.value = t;

    // Pointer parallax (smoothed)
    this.pointerSmooth.lerp(this.pointer, 0.05);

    if (this.introTl && this.introTl.isActive()) {
      // Intro drives both the camera and the particle state machine
      const I = this.intro;
      u.uFieldW.value = I.fieldW;
      u.uTextW.value = I.textW;
      u.uScatterW.value = I.scatterW;
      u.uChipW.value = I.chipW;
      u.uNetworkW.value = I.networkW;
      if (this.traceUniforms) this.traceUniforms.uReveal.value = I.traceReveal;
      if (this.viaUniforms) this.viaUniforms.uReveal.value = I.traceReveal;
      (this.networkLines.material as THREE.LineBasicMaterial).opacity = I.networkW * 0.34;
      this.tmpPos.copy(I.pos);
      this.applyDolly(this.tmpPos, I.look);
      this.camera.position.lerp(this.tmpPos, 1 - Math.pow(0.001, dt));
      this.camera.lookAt(I.look);
    } else {
      this.applyScrollState();
      this.applyDolly(this.tmpPos, this.tmpLook);
      this.camera.position.lerp(this.tmpPos, 1 - Math.pow(0.0005, dt));
      // Parallax offset
      this.camera.position.x += this.pointerSmooth.x * 0.45;
      this.camera.position.y += this.pointerSmooth.y * 0.28;
      this.camera.lookAt(this.tmpLook);
    }

    // Electrical activity on the die (activation heartbeat)
    const heart = 0.85 + 0.3 * Math.sin(t * 2.1) + 0.12 * Math.sin(t * 5.7);
    this.dieMaterial.emissiveIntensity = Math.max(0.1, heart * this.dieActivation * this.dieTierFactor);
    // Orbiting pulse light — controlled "current" around the package
    const pa = t * 0.5;
    this.pulseLight.position.set(Math.cos(pa) * 2.6, 1.1 + Math.sin(t * 0.8) * 0.35, Math.sin(pa) * 2.6);
    this.pulseLight.intensity = (4.8 + 3.2 * Math.sin(t * 2.4) * Math.sin(t * 1.3)) * this.pulseBoost;

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  };

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
    if (this.cinematicPass) {
      this.cinematicPass.uniforms.uResolution.value.set(w, h);
    }
    const pr = Math.min(window.devicePixelRatio || 1, this.cfg.dpr);
    this.renderer.setPixelRatio(pr);
    if (this.particleUniforms) this.particleUniforms.uPixelRatio.value = pr;
  }

  start() {
    this.lastTime = performance.now();
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  pause() {
    this.running = false;
  }

  resume() {
    this.running = true;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.introTl?.kill();
    this.scene.traverse((o) => {
      const obj = o as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      const mat = obj.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.chipTextures.forEach((t) => t.dispose());
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
