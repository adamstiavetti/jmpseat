import * as THREE from "three";

type VoxelQuality = "lowMobile" | "mobile" | "desktop";

export type MaterializeMaterialOptions = {
  baseColor?: number;
  opacity?: number;
};

export type MaterializeEffectOptions = {
  duration: number;
  delay: number;
  direction: THREE.Vector3;
  edgeColor: number;
  glowIntensity: number;
  noiseScale: number;
  dissolveWidth: number;
  scanlineIntensity: number;
  particleCount: number;
  voxelCount: number;
  voxelSize: number;
  stagger: number;
  staggerAmount: number;
  noiseAmount: number;
  finalMeshRevealStart: number;
  quality: VoxelQuality;
  debug: boolean;
};

export type MaterializeTriggerOptions = Partial<
  Pick<MaterializeEffectOptions, "duration" | "delay" | "stagger" | "finalMeshRevealStart">
> & {
  direction?: THREE.Vector3;
};

type VoxelProxyState = {
  mesh: THREE.Mesh;
  originalVisible: boolean;
  originalMaterialStates: MaterialFadeState[];
  voxelMesh: THREE.InstancedMesh<THREE.BoxGeometry, THREE.ShaderMaterial>;
  wireMesh: THREE.InstancedMesh<THREE.BoxGeometry, THREE.ShaderMaterial> | null;
  sparkPoints: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null;
  voxelMaterial: THREE.ShaderMaterial;
  wireMaterial: THREE.ShaderMaterial | null;
  sparkMaterial: THREE.ShaderMaterial | null;
  phaseOffset: number;
  completed: boolean;
};

type MaterialFadeState = {
  material: THREE.Material;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
  opacityUniform?: { value: number };
  opacityUniformValue?: number;
  strengthUniform?: { value: number };
  strengthUniformValue?: number;
  materializeOpacityUniform?: { value: number };
  materializeOpacityUniformValue?: number;
};

type SphereGeometryLike = THREE.BufferGeometry & {
  parameters?: {
    radius?: number;
  };
};

export type MaterializeHandle = {
  root: THREE.Object3D;
  states: VoxelProxyState[];
  effect: MaterializeEffectOptions;
  startTime: number;
  active: boolean;
  completed: boolean;
};

const QUALITY_PRESETS: Record<
  VoxelQuality,
  Pick<MaterializeEffectOptions, "voxelCount" | "particleCount" | "voxelSize" | "scanlineIntensity" | "glowIntensity">
> = {
  lowMobile: {
    voxelCount: 260,
    particleCount: 80,
    voxelSize: 0.011,
    scanlineIntensity: 0.42,
    glowIntensity: 1.35,
  },
  mobile: {
    voxelCount: 620,
    particleCount: 140,
    voxelSize: 0.0085,
    scanlineIntensity: 0.5,
    glowIntensity: 1.55,
  },
  desktop: {
    voxelCount: 1550,
    particleCount: 260,
    voxelSize: 0.006,
    scanlineIntensity: 0.66,
    glowIntensity: 1.95,
  },
};

const DEFAULT_EFFECT: MaterializeEffectOptions = {
  duration: 1.45,
  delay: 0,
  direction: new THREE.Vector3(0, 1, 0),
  edgeColor: 0x31a5ff,
  glowIntensity: QUALITY_PRESETS.desktop.glowIntensity,
  noiseScale: 9,
  dissolveWidth: 0.12,
  scanlineIntensity: QUALITY_PRESETS.desktop.scanlineIntensity,
  particleCount: QUALITY_PRESETS.desktop.particleCount,
  voxelCount: QUALITY_PRESETS.desktop.voxelCount,
  voxelSize: QUALITY_PRESETS.desktop.voxelSize,
  stagger: 0.018,
  staggerAmount: 0.085,
  noiseAmount: 0.55,
  finalMeshRevealStart: 0.9,
  quality: "desktop",
  debug: false,
};

const hashNoiseGLSL = `
float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}
`;

function getMaterials(mesh: THREE.Mesh) {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function captureMaterialFadeState(mesh: THREE.Mesh): MaterialFadeState[] {
  return getMaterials(mesh).map((material) => {
    const shaderMaterial = material instanceof THREE.ShaderMaterial ? material : null;
    const uniforms = shaderMaterial?.uniforms;
    return {
      material,
      opacity: material.opacity,
      transparent: material.transparent,
      depthWrite: material.depthWrite,
      opacityUniform: uniforms?.opacity,
      opacityUniformValue: uniforms?.opacity?.value,
      strengthUniform: uniforms?.strength,
      strengthUniformValue: uniforms?.strength?.value,
      materializeOpacityUniform: uniforms?.materializeOpacity,
      materializeOpacityUniformValue: uniforms?.materializeOpacity?.value,
    };
  });
}

function setFinalMaterialAlpha(state: VoxelProxyState, alpha: number) {
  const easedAlpha = THREE.MathUtils.clamp(alpha, 0, 1);
  for (const materialState of state.originalMaterialStates) {
    materialState.material.transparent = true;
    materialState.material.opacity = materialState.opacity * easedAlpha;
    if (easedAlpha < 1) {
      materialState.material.depthWrite = false;
    }
    if (materialState.opacityUniform) {
      materialState.opacityUniform.value = (materialState.opacityUniformValue ?? 1) * easedAlpha;
    }
    if (materialState.strengthUniform) {
      materialState.strengthUniform.value = (materialState.strengthUniformValue ?? 1) * easedAlpha;
    }
    if (materialState.materializeOpacityUniform) {
      materialState.materializeOpacityUniform.value = (materialState.materializeOpacityUniformValue ?? 1) * easedAlpha;
    }
    materialState.material.needsUpdate = true;
  }
}

function restoreFinalMaterialAlpha(state: VoxelProxyState) {
  for (const materialState of state.originalMaterialStates) {
    materialState.material.opacity = materialState.opacity;
    materialState.material.transparent = materialState.transparent;
    materialState.material.depthWrite = materialState.depthWrite;
    if (materialState.opacityUniform) {
      materialState.opacityUniform.value = materialState.opacityUniformValue ?? 1;
    }
    if (materialState.strengthUniform) {
      materialState.strengthUniform.value = materialState.strengthUniformValue ?? 1;
    }
    if (materialState.materializeOpacityUniform) {
      materialState.materializeOpacityUniform.value = materialState.materializeOpacityUniformValue ?? 1;
    }
    materialState.material.needsUpdate = true;
  }
}

function detectRuntimeQuality(): VoxelQuality {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const width = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  if (width <= 520 || pixelRatio > 2.2) {
    return "lowMobile";
  }
  if (width <= 900) {
    return "mobile";
  }
  return "desktop";
}

function getEffectOptions(effectOptions?: Partial<MaterializeEffectOptions>) {
  const quality = effectOptions?.quality ?? detectRuntimeQuality();
  const preset = QUALITY_PRESETS[quality];
  const requestedParticleCount = effectOptions?.particleCount ?? preset.particleCount;
  const requestedVoxelCount = effectOptions?.voxelCount ?? effectOptions?.particleCount ?? preset.voxelCount;
  const merged = {
    ...DEFAULT_EFFECT,
    ...preset,
    ...effectOptions,
    quality,
    particleCount: requestedParticleCount,
    voxelCount: requestedVoxelCount,
  };

  return {
    ...merged,
    direction: (effectOptions?.direction ?? DEFAULT_EFFECT.direction).clone().normalize(),
    finalMeshRevealStart: THREE.MathUtils.clamp(merged.finalMeshRevealStart, 0.68, 0.96),
  };
}

function createVoxelMaterial(effect: MaterializeEffectOptions, wireframe = false) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    wireframe,
    uniforms: {
      uRevealProgress: { value: 0 },
      uTime: { value: 0 },
      uEdgeColor: { value: new THREE.Color(effect.edgeColor) },
      uGlowIntensity: { value: effect.glowIntensity },
      uNoiseAmount: { value: effect.noiseAmount },
      uStaggerAmount: { value: effect.staggerAmount },
      uDissolveWidth: { value: effect.dissolveWidth },
      uScanlineIntensity: { value: effect.scanlineIntensity },
      uFinalMeshRevealStart: { value: effect.finalMeshRevealStart },
      uProxyOpacity: { value: 1 },
    },
    vertexShader: `
      attribute float aVoxelHeight;
      attribute float aVoxelDelay;
      attribute float aVoxelFlicker;
      attribute float aVoxelScale;
      attribute float aVoxelColorMix;
      attribute vec3 aStartOffset;
      uniform float uRevealProgress;
      uniform float uTime;
      uniform float uNoiseAmount;
      uniform float uStaggerAmount;
      uniform float uDissolveWidth;
      uniform float uFinalMeshRevealStart;
      varying float vAlpha;
      varying float vEdge;
      varying float vColorMix;
      varying vec3 vLocalNormal;
      ${hashNoiseGLSL}
      void main() {
        float edgeNoise = (hash31(vec3(aVoxelHeight * 9.1, aVoxelDelay * 4.7, aVoxelFlicker)) - 0.5) * uNoiseAmount * 0.16;
        float activation = clamp(aVoxelHeight + aVoxelDelay * uStaggerAmount + edgeNoise, 0.0, 1.0);
        float build = smoothstep(activation, activation + max(0.035, uDissolveWidth), uRevealProgress);
        float settle = smoothstep(activation + 0.04, activation + 0.2, uRevealProgress);
        float edge = 1.0 - smoothstep(0.0, max(0.035, uDissolveWidth * 1.45), abs(uRevealProgress - activation));
        float startGate = smoothstep(0.015, 0.055, uRevealProgress);
        float flicker = 0.76 + 0.24 * sin(uTime * (12.0 + aVoxelFlicker * 8.0) + aVoxelFlicker * 18.0);
        float pulse = mix(0.82, 1.18, flicker);
        float scaleProgress = max(0.001, build);
        vec3 drift = aStartOffset * (1.0 - settle);
        vec3 jitter = vec3(
          sin(uTime * 9.0 + aVoxelFlicker * 19.0),
          cos(uTime * 8.0 + aVoxelFlicker * 17.0),
          sin(uTime * 10.0 + aVoxelFlicker * 13.0)
        ) * edge * uNoiseAmount * 0.006;
        vec3 transformed = (instanceMatrix * vec4(position * scaleProgress * pulse * aVoxelScale, 1.0)).xyz;
        transformed += drift + jitter;
        vAlpha = startGate * build * (0.34 + edge * 0.72) * flicker;
        vEdge = edge;
        vColorMix = aVoxelColorMix;
        vLocalNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uEdgeColor;
      uniform float uGlowIntensity;
      uniform float uScanlineIntensity;
      uniform float uProxyOpacity;
      varying float vAlpha;
      varying float vEdge;
      varying float vColorMix;
      varying vec3 vLocalNormal;
      void main() {
        float normalGlow = pow(1.0 - abs(normalize(vLocalNormal).z), 1.6);
        float scan = step(0.74, fract((gl_FragCoord.y * 0.085) + vColorMix * 5.0)) * uScanlineIntensity;
        float alpha = vAlpha * uProxyOpacity * (0.74 + vEdge * 0.55 + scan * 0.22);
        if (alpha <= 0.01) discard;
        vec3 ice = vec3(0.74, 0.96, 1.0);
        vec3 electric = uEdgeColor * (1.05 + uGlowIntensity * 0.22);
        vec3 color = mix(electric, ice, clamp(vColorMix * 0.35 + vEdge * 0.45 + normalGlow * 0.18, 0.0, 1.0));
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

export function createMaterializeMaterial(
  baseOptions: MaterializeMaterialOptions = {},
  effectOptions: Partial<MaterializeEffectOptions> = {},
) {
  const effect = getEffectOptions(effectOptions);
  const material = createVoxelMaterial(effect);
  material.uniforms.uProxyOpacity.value = baseOptions.opacity ?? 1;
  return material;
}

function createSparkMaterial(effect: MaterializeEffectOptions) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uRevealProgress: { value: 0 },
      uTime: { value: 0 },
      uEdgeColor: { value: new THREE.Color(effect.edgeColor) },
      uFinalMeshRevealStart: { value: effect.finalMeshRevealStart },
    },
    vertexShader: `
      attribute float aVoxelHeight;
      attribute float aVoxelDelay;
      attribute float aVoxelFlicker;
      attribute vec3 aStartOffset;
      uniform float uRevealProgress;
      uniform float uTime;
      uniform float uFinalMeshRevealStart;
      varying float vAlpha;
      varying float vSparkMix;
      void main() {
        float activation = clamp(aVoxelHeight + aVoxelDelay * 0.1, 0.0, 1.0);
        float band = 1.0 - smoothstep(0.0, 0.14, abs(uRevealProgress - activation));
        float startGate = smoothstep(0.02, 0.06, uRevealProgress);
        float finalFade = 1.0 - smoothstep(uFinalMeshRevealStart, 1.0, uRevealProgress);
        vec3 drift = aStartOffset * (0.38 + 0.25 * sin(uTime * 5.0 + aVoxelFlicker * 6.0));
        vec3 finalPos = position + drift * band;
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        vAlpha = startGate * band * finalFade * (0.45 + 0.55 * sin(uTime * 12.0 + aVoxelFlicker * 18.0));
        vSparkMix = aVoxelFlicker;
        gl_PointSize = mix(1.0, 3.8, band) * (280.0 / max(80.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uEdgeColor;
      varying float vAlpha;
      varying float vSparkMix;
      void main() {
        vec2 centered = gl_PointCoord - 0.5;
        float disc = 1.0 - smoothstep(0.08, 0.5, length(centered));
        float alpha = disc * vAlpha;
        if (alpha <= 0.01) discard;
        vec3 color = mix(uEdgeColor, vec3(0.88, 0.98, 1.0), vSparkMix * 0.45);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

function sampleSourcePositions(mesh: THREE.Mesh, count: number) {
  const source = mesh.geometry.attributes.position;
  const sourceCount = source?.count ?? 0;
  if (!source || sourceCount === 0 || count <= 0) {
    return [];
  }

  if (mesh.geometry.type === "SphereGeometry") {
    const sphereGeometry = mesh.geometry as SphereGeometryLike;
    const radius = typeof sphereGeometry.parameters?.radius === "number" ? sphereGeometry.parameters.radius : null;
    if (radius) {
      const sphereSamples: THREE.Vector3[] = [];
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const maxSamples = Math.max(24, count);
      for (let index = 0; index < maxSamples; index += 1) {
        const y = 1 - (index / Math.max(1, maxSamples - 1)) * 2;
        const radial = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = index * goldenAngle;
        sphereSamples.push(
          new THREE.Vector3(
            Math.cos(theta) * radial * radius,
            y * radius,
            Math.sin(theta) * radial * radius,
          ),
        );
      }
      return sphereSamples;
    }
  }

  const samples: THREE.Vector3[] = [];
  const maxSamples = Math.min(count, sourceCount);
  const goldenRatio = 0.61803398875;
  for (let index = 0; index < maxSamples; index += 1) {
    const sourceIndex = Math.floor(((index * goldenRatio) % 1) * sourceCount);
    samples.push(new THREE.Vector3(source.getX(sourceIndex), source.getY(sourceIndex), source.getZ(sourceIndex)));
  }
  return samples;
}

function addInstancedAttributes(
  geometry: THREE.InstancedBufferGeometry | THREE.BoxGeometry,
  heights: Float32Array,
  delays: Float32Array,
  flickers: Float32Array,
  scales: Float32Array,
  colorMixes: Float32Array,
  startOffsets: Float32Array,
) {
  geometry.setAttribute("aVoxelHeight", new THREE.InstancedBufferAttribute(heights, 1));
  geometry.setAttribute("aVoxelDelay", new THREE.InstancedBufferAttribute(delays, 1));
  geometry.setAttribute("aVoxelFlicker", new THREE.InstancedBufferAttribute(flickers, 1));
  geometry.setAttribute("aVoxelScale", new THREE.InstancedBufferAttribute(scales, 1));
  geometry.setAttribute("aVoxelColorMix", new THREE.InstancedBufferAttribute(colorMixes, 1));
  geometry.setAttribute("aStartOffset", new THREE.InstancedBufferAttribute(startOffsets, 3));
}

function createVoxelProxy(mesh: THREE.Mesh, effect: MaterializeEffectOptions) {
  const sourceCount = mesh.geometry.attributes.position?.count ?? 0;
  const targetCount = THREE.MathUtils.clamp(effect.voxelCount, 24, sourceCount || effect.voxelCount);
  const samples = sampleSourcePositions(mesh, targetCount);
  if (samples.length === 0) {
    return null;
  }

  mesh.geometry.computeBoundingBox();
  const bounds = mesh.geometry.boundingBox ?? new THREE.Box3().setFromPoints(samples);
  const ySpan = Math.max(0.0001, bounds.max.y - bounds.min.y);
  const size = new THREE.Vector3();
  bounds.getSize(size);
  const longestAxis = Math.max(size.x, size.y, size.z, 0.001);
  const nonZeroAxes = [size.x, size.y, size.z].filter((axis) => axis > 0.0001);
  const shortestAxis = Math.max(Math.min(...nonZeroAxes), longestAxis * 0.01);
  const rawCubeSize = Math.min(longestAxis * effect.voxelSize, shortestAxis * 0.42);
  const minCubeSize = longestAxis < 0.12 ? longestAxis * 0.12 : longestAxis * 0.0025;
  const maxCubeSize = longestAxis * 0.0085;
  const cubeSize = THREE.MathUtils.clamp(rawCubeSize, minCubeSize, maxCubeSize);
  const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, 1, 1, 1);

  const heights = new Float32Array(samples.length);
  const delays = new Float32Array(samples.length);
  const flickers = new Float32Array(samples.length);
  const scales = new Float32Array(samples.length);
  const colorMixes = new Float32Array(samples.length);
  const startOffsets = new Float32Array(samples.length * 3);
  const sparkPositions = new Float32Array(Math.min(effect.particleCount, samples.length) * 3);
  const matrix = new THREE.Matrix4();
  const snap = cubeSize * 0.85;
  const direction = effect.direction.clone().normalize();

  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    const height = THREE.MathUtils.clamp((sample.y - bounds.min.y) / ySpan, 0, 1);
    const randomA = Math.abs(Math.sin(index * 12.9898 + sample.x * 78.233 + sample.z * 37.719) * 43758.5453) % 1;
    const randomB = Math.abs(Math.sin(index * 4.898 + sample.y * 65.311) * 23421.631) % 1;
    const snapped = new THREE.Vector3(
      Math.round(sample.x / snap) * snap,
      Math.round(sample.y / snap) * snap,
      Math.round(sample.z / snap) * snap,
    );
    matrix.makeTranslation(snapped.x, snapped.y, snapped.z);
    heights[index] = height;
    delays[index] = randomA;
    flickers[index] = randomB;
    scales[index] = 0.42 + randomA * 0.46;
    colorMixes[index] = randomB;
    const offset = direction
      .clone()
      .multiplyScalar((0.018 + randomA * 0.06) * longestAxis)
      .add(new THREE.Vector3((randomB - 0.5) * 0.014, randomA * 0.026, (randomA - 0.5) * 0.014).multiplyScalar(longestAxis));
    startOffsets[index * 3] = offset.x;
    startOffsets[index * 3 + 1] = offset.y;
    startOffsets[index * 3 + 2] = offset.z;
    if (index < sparkPositions.length / 3) {
      sparkPositions[index * 3] = snapped.x;
      sparkPositions[index * 3 + 1] = snapped.y;
      sparkPositions[index * 3 + 2] = snapped.z;
    }
  }

  addInstancedAttributes(cubeGeometry, heights, delays, flickers, scales, colorMixes, startOffsets);

  const voxelMaterial = createVoxelMaterial(effect);
  const voxelMesh = new THREE.InstancedMesh(cubeGeometry, voxelMaterial, samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    const snapped = new THREE.Vector3(
      Math.round(sample.x / snap) * snap,
      Math.round(sample.y / snap) * snap,
      Math.round(sample.z / snap) * snap,
    );
    matrix.makeTranslation(snapped.x, snapped.y, snapped.z);
    voxelMesh.setMatrixAt(index, matrix);
  }
  voxelMesh.instanceMatrix.needsUpdate = true;
  voxelMesh.name = `${mesh.name || "mesh"}-voxel-materialize`;
  voxelMesh.position.copy(mesh.position);
  voxelMesh.quaternion.copy(mesh.quaternion);
  voxelMesh.scale.copy(mesh.scale);
  voxelMesh.renderOrder = 12;
  voxelMesh.visible = false;
  voxelMesh.frustumCulled = false;

  const wireMaterial = effect.quality === "lowMobile" ? null : createVoxelMaterial(effect, true);
  const wireMesh = wireMaterial ? new THREE.InstancedMesh(cubeGeometry, wireMaterial, samples.length) : null;
  if (wireMesh) {
    for (let index = 0; index < samples.length; index += 1) {
      voxelMesh.getMatrixAt(index, matrix);
      wireMesh.setMatrixAt(index, matrix);
    }
    wireMesh.instanceMatrix.needsUpdate = true;
    wireMesh.name = `${mesh.name || "mesh"}-voxel-wire`;
    wireMesh.position.copy(mesh.position);
    wireMesh.quaternion.copy(mesh.quaternion);
    wireMesh.scale.copy(mesh.scale);
    wireMesh.renderOrder = 13;
    wireMesh.visible = false;
    wireMesh.frustumCulled = false;
  }

  const sparkMaterial = effect.particleCount > 0 ? createSparkMaterial(effect) : null;
  const sparkPoints = sparkMaterial ? new THREE.Points(new THREE.BufferGeometry(), sparkMaterial) : null;
  if (sparkPoints) {
    const sparkCount = sparkPositions.length / 3;
    sparkPoints.geometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    sparkPoints.geometry.setAttribute("aVoxelHeight", new THREE.BufferAttribute(heights.subarray(0, sparkCount), 1));
    sparkPoints.geometry.setAttribute("aVoxelDelay", new THREE.BufferAttribute(delays.subarray(0, sparkCount), 1));
    sparkPoints.geometry.setAttribute("aVoxelFlicker", new THREE.BufferAttribute(flickers.subarray(0, sparkCount), 1));
    sparkPoints.geometry.setAttribute("aStartOffset", new THREE.BufferAttribute(startOffsets.subarray(0, sparkCount * 3), 3));
    sparkPoints.name = `${mesh.name || "mesh"}-voxel-sparks`;
    sparkPoints.position.copy(mesh.position);
    sparkPoints.quaternion.copy(mesh.quaternion);
    sparkPoints.scale.copy(mesh.scale);
    sparkPoints.renderOrder = 14;
    sparkPoints.visible = false;
    sparkPoints.frustumCulled = false;
  }

  return { voxelMesh, wireMesh, sparkPoints, voxelMaterial, wireMaterial, sparkMaterial };
}

export function createVoxelMaterializeProxy(
  meshOrGroup: THREE.Object3D,
  options: Partial<MaterializeEffectOptions> = {},
): MaterializeHandle {
  const effect = getEffectOptions(options);
  const states: VoxelProxyState[] = [];

  meshOrGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.geometry || !child.parent) {
      return;
    }

    const proxy = createVoxelProxy(child, effect);
    if (!proxy) {
      return;
    }

    child.parent.add(proxy.voxelMesh);
    if (proxy.wireMesh) {
      child.parent.add(proxy.wireMesh);
    }
    if (proxy.sparkPoints) {
      child.parent.add(proxy.sparkPoints);
    }

    states.push({
      mesh: child,
      originalVisible: child.visible,
      originalMaterialStates: captureMaterialFadeState(child),
      voxelMesh: proxy.voxelMesh,
      wireMesh: proxy.wireMesh,
      sparkPoints: proxy.sparkPoints,
      voxelMaterial: proxy.voxelMaterial,
      wireMaterial: proxy.wireMaterial,
      sparkMaterial: proxy.sparkMaterial,
      phaseOffset: states.length * effect.stagger,
      completed: false,
    });
    setFinalMaterialAlpha(states[states.length - 1], 0);
  });

  return {
    root: meshOrGroup,
    states,
    effect,
    startTime: 0,
    active: false,
    completed: false,
  };
}

export function triggerVoxelMaterialize(
  handle: MaterializeHandle,
  options: MaterializeTriggerOptions = {},
  time = 0,
) {
  handle.effect = getEffectOptions({
    ...handle.effect,
    ...options,
    direction: options.direction ?? handle.effect.direction,
  });
  handle.startTime = time + (options.delay ?? handle.effect.delay);
  handle.active = true;
  handle.completed = false;
  for (const state of handle.states) {
    state.completed = false;
    setFinalMaterialAlpha(state, 0);
    state.mesh.visible = state.originalVisible;
    state.voxelMesh.visible = true;
    state.voxelMaterial.uniforms.uRevealProgress.value = 0;
    state.voxelMaterial.uniforms.uProxyOpacity.value = 1;
    if (state.wireMesh && state.wireMaterial) {
      state.wireMesh.visible = true;
      state.wireMaterial.uniforms.uRevealProgress.value = 0;
      state.wireMaterial.uniforms.uProxyOpacity.value = 0.82;
    }
    if (state.sparkPoints && state.sparkMaterial) {
      state.sparkPoints.visible = true;
      state.sparkMaterial.uniforms.uRevealProgress.value = 0;
    }
  }
}

function updateVoxelUniforms(
  material: THREE.ShaderMaterial,
  effect: MaterializeEffectOptions,
  progress: number,
  deltaTime: number,
  proxyOpacity: number,
) {
  material.uniforms.uRevealProgress.value = progress;
  material.uniforms.uTime.value += deltaTime;
  material.uniforms.uEdgeColor.value.setHex(effect.edgeColor);
  material.uniforms.uGlowIntensity.value = effect.glowIntensity;
  material.uniforms.uNoiseAmount.value = effect.noiseAmount;
  material.uniforms.uStaggerAmount.value = effect.staggerAmount;
  material.uniforms.uDissolveWidth.value = effect.dissolveWidth;
  material.uniforms.uScanlineIntensity.value = effect.scanlineIntensity;
  material.uniforms.uFinalMeshRevealStart.value = effect.finalMeshRevealStart;
  material.uniforms.uProxyOpacity.value = proxyOpacity;
}

export function updateVoxelMaterializeEffects(handles: MaterializeHandle[], time: number, deltaTime: number) {
  for (const handle of handles) {
    if (!handle.active || handle.completed) {
      continue;
    }

    const duration = Math.max(handle.effect.duration, 0.001);
    let finishedCount = 0;
    for (const state of handle.states) {
      const localStart = handle.startTime + state.phaseOffset;
      const linear = THREE.MathUtils.clamp((time - localStart) / duration, 0, 1);
      const eased = THREE.MathUtils.smootherstep(linear, 0, 1);
      const proxyFadeStart = Math.max(handle.effect.finalMeshRevealStart + 0.025, 0.92);
      const proxyFade = 1 - THREE.MathUtils.smootherstep(eased, proxyFadeStart, 1);
      const proxyOpacity = THREE.MathUtils.clamp(proxyFade, 0, 1);
      updateVoxelUniforms(state.voxelMaterial, handle.effect, eased, deltaTime, proxyOpacity);
      if (state.wireMaterial) {
        updateVoxelUniforms(state.wireMaterial, handle.effect, eased, deltaTime, proxyOpacity * 0.72);
      }
      if (state.sparkMaterial) {
        state.sparkMaterial.uniforms.uRevealProgress.value = eased;
        state.sparkMaterial.uniforms.uTime.value += deltaTime;
        state.sparkMaterial.uniforms.uEdgeColor.value.setHex(handle.effect.edgeColor);
        state.sparkMaterial.uniforms.uFinalMeshRevealStart.value = handle.effect.finalMeshRevealStart;
      }

      const finalAlpha = THREE.MathUtils.smootherstep(eased, handle.effect.finalMeshRevealStart, 1);
      setFinalMaterialAlpha(state, finalAlpha);
      state.mesh.visible = state.originalVisible;

      if (linear >= 1) {
        state.completed = true;
        finishedCount += 1;
      }
    }

    if (finishedCount === handle.states.length) {
      handle.completed = true;
      handle.active = false;
      for (const state of handle.states) {
        state.mesh.visible = state.originalVisible;
        restoreFinalMaterialAlpha(state);
        state.voxelMesh.visible = false;
        if (state.wireMesh) {
          state.wireMesh.visible = false;
        }
        if (state.sparkPoints) {
          state.sparkPoints.visible = false;
        }
      }
    }
  }
}

export function disposeVoxelMaterializeEffect(handle: MaterializeHandle) {
  for (const state of handle.states) {
    state.mesh.visible = state.originalVisible;
    restoreFinalMaterialAlpha(state);
    state.voxelMesh.removeFromParent();
    state.voxelMesh.geometry.dispose();
    state.voxelMaterial.dispose();
    if (state.wireMesh && state.wireMaterial) {
      state.wireMesh.removeFromParent();
      state.wireMaterial.dispose();
    }
    if (state.sparkPoints && state.sparkMaterial) {
      state.sparkPoints.removeFromParent();
      state.sparkPoints.geometry.dispose();
      state.sparkMaterial.dispose();
    }
  }
  handle.states.length = 0;
}

export const applyMaterializeEffect = createVoxelMaterializeProxy;
export const triggerMaterialize = triggerVoxelMaterialize;
export const updateMaterializeEffects = updateVoxelMaterializeEffects;
export const disposeMaterializeHandle = disposeVoxelMaterializeEffect;
