<template>
  <div ref="host" class="pharma-scene relative h-full min-h-[540px] overflow-hidden rounded-[28px] border border-white/10">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(71,215,255,0.14),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(0,255,170,0.12),transparent_24%),linear-gradient(180deg,rgba(8,16,28,0.92),rgba(4,10,18,0.98))]" />
    <div class="pointer-events-none absolute left-4 top-4 z-10 max-w-[320px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
      <div class="text-[11px] uppercase tracking-[0.32em] text-cyan-200/75">Three.js workshop twin</div>
      <div class="mt-2 text-sm text-white/85">
        拖拽旋转，滚轮缩放，点击 bay 切换高亮。
      </div>
    </div>
    <div class="pointer-events-none absolute bottom-4 left-4 z-10 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md">
      <div class="text-xs text-white/50">工艺链</div>
      <div class="mt-1 text-sm text-white/85">反应釜 → 离心 / 三合一 → 干燥器</div>
    </div>
    <div class="pointer-events-none absolute right-4 bottom-4 z-10 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right backdrop-blur-md">
      <div class="text-xs text-white/50">视图状态</div>
      <div class="mt-1 text-sm text-white/85">5 个 bay，4 层结构，实时模拟</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Fog,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SphereGeometry,
  TorusGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { BayHealth, BayMode, PharmaBay } from '@/composables/usePharmaTwin';

const props = defineProps<{
  bays: PharmaBay[];
  selectedBayId: number;
}>();

const emit = defineEmits<{
  selectBay: [bayId: number];
}>();

const host = ref<HTMLDivElement | null>(null);
const selectedBay = computed(() => props.bays.find((bay) => bay.id === props.selectedBayId) ?? props.bays[0] ?? null);

type BayVisual = {
  group: Group;
  frame: Mesh;
  frameEdge: LineSegments;
  reactorCore: Mesh;
  reactorCoreMaterial: MeshStandardMaterial;
  separatorRotor?: Mesh;
  dryerFan: Mesh;
  lamp: Mesh;
  selectedRing: Mesh;
  statusPanel: Mesh;
  highlightMaterial: MeshStandardMaterial;
  floorMaterials: MeshStandardMaterial[];
  bayId: number;
};

const bayVisuals = new Map<number, BayVisual>();
const pickTargets: Mesh[] = [];

let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let resizeObserver: ResizeObserver | null = null;
let animationFrame = 0;

const raycaster = new Raycaster();
const pointer = new Vector2();

function bayTone(health: BayHealth) {
  if (health === 'alarm') return 0xff6b6b;
  if (health === 'warning') return 0xffc857;
  return 0x47d7ff;
}

function bayAccent(mode: BayMode) {
  return mode === 'centrifuge' ? 0x69f0ae : 0x8fe6ff;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createFloorPanel(y: number, bay: PharmaBay) {
  const panelGeometry = new BoxGeometry(5.9, 0.26, 4.8);
  const panelMaterial = new MeshStandardMaterial({
    color: 0x12253d,
    metalness: 0.2,
    roughness: 0.92,
    transparent: true,
    opacity: 0.82,
  });
  const panel = new Mesh(panelGeometry, panelMaterial);
  panel.position.y = y;
  panel.position.z = 0;

  const railGeometry = new BoxGeometry(5.9, 0.04, 0.1);
  const railMaterial = new MeshStandardMaterial({
    color: bayAccent(bay.mode),
    emissive: bayAccent(bay.mode),
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.88,
  });
  const railFront = new Mesh(railGeometry, railMaterial);
  railFront.position.set(0, 0.18, 2.35);
  const railBack = railFront.clone();
  railBack.position.z = -2.35;
  panel.add(railFront, railBack);

  return panel;
}

function createTankGroup() {
  const group = new Group();
  const tankBody = new Mesh(
    new CylinderGeometry(1.15, 1.15, 2.8, 20),
    new MeshStandardMaterial({
      color: 0x254765,
      metalness: 0.25,
      roughness: 0.55,
      emissive: 0x0e2232,
      emissiveIntensity: 0.15,
    }),
  );
  const tankCap = new Mesh(
    new SphereGeometry(1.12, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new MeshStandardMaterial({
      color: 0x356d8f,
      metalness: 0.2,
      roughness: 0.48,
      emissive: 0x103047,
      emissiveIntensity: 0.08,
    }),
  );
  tankCap.position.y = 1.4;
  group.add(tankBody, tankCap);
  return group;
}

function createBayVisual(bay: PharmaBay, index: number, total: number) {
  if (!scene) return null;

  const group = new Group();
  const x = (index - (total - 1) / 2) * 11;
  group.position.set(x, -5.6, 0);
  group.userData.bayId = bay.id;
  scene.add(group);

  const shellMaterial = new MeshStandardMaterial({
    color: 0x0d1a2a,
    transparent: true,
    opacity: 0.3,
    roughness: 0.92,
    metalness: 0.1,
    side: DoubleSide,
  });
  const shell = new Mesh(new BoxGeometry(7.3, 18.4, 6), shellMaterial);
  shell.position.y = 3.2;
  group.add(shell);

  const shellEdges = new LineSegments(
    new EdgesGeometry(shell.geometry),
    new LineBasicMaterial({ color: 0x4ad8ff, transparent: true, opacity: 0.22 }),
  );
  shellEdges.position.copy(shell.position);
  group.add(shellEdges);

  const floorMaterials: MeshStandardMaterial[] = [];
  [11.2, 6.7, 2.2, -2.3].forEach((y, floorIndex) => {
    const floorPanel = createFloorPanel(y, bay);
    group.add(floorPanel);
    floorMaterials.push(floorPanel.material as MeshStandardMaterial);

    const columnGeometry = new BoxGeometry(0.18, 3.2, 0.18);
    const columnMaterial = new MeshStandardMaterial({
      color: 0x3b5670,
      roughness: 0.65,
      metalness: 0.18,
    });
    [-2.8, 2.8].forEach((offsetX) => {
      [-2.1, 2.1].forEach((offsetZ) => {
        const column = new Mesh(columnGeometry, columnMaterial);
        column.position.set(offsetX, y - 0.8, offsetZ);
        group.add(column);
      });
    });
    if (floorIndex < 3) {
      const connector = new Mesh(
        new BoxGeometry(5.4, 0.12, 0.08),
        new MeshStandardMaterial({
          color: bayAccent(bay.mode),
          emissive: bayAccent(bay.mode),
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.9,
        }),
      );
      connector.position.set(0, y - 0.05, 0);
      group.add(connector);
    }
  });

  const topFrame = new Mesh(
    new BoxGeometry(6.4, 0.32, 5.2),
    new MeshStandardMaterial({
      color: 0x173149,
      transparent: true,
      opacity: 0.7,
      roughness: 0.75,
      metalness: 0.2,
    }),
  );
  topFrame.position.y = 12.2;
  group.add(topFrame);

  const baseFrame = new Mesh(
    new BoxGeometry(6.4, 0.32, 5.2),
    new MeshStandardMaterial({
      color: 0x173149,
      transparent: true,
      opacity: 0.7,
      roughness: 0.75,
      metalness: 0.2,
    }),
  );
  baseFrame.position.y = -3.9;
  group.add(baseFrame);

  const towerPipe = new Mesh(
    new CylinderGeometry(0.18, 0.18, 14.8, 14),
    new MeshStandardMaterial({
      color: 0x3d6079,
      emissive: 0x122536,
      emissiveIntensity: 0.08,
      metalness: 0.3,
      roughness: 0.58,
    }),
  );
  towerPipe.position.set(-3.2, 4.1, -1.8);
  group.add(towerPipe);

  const lamp = new Mesh(
    new SphereGeometry(0.22, 18, 14),
    new MeshBasicMaterial({ color: bayTone(bay.health) }),
  );
  lamp.position.set(3.2, 12.7, 0);
  group.add(lamp);

  const selectedRing = new Mesh(
    new TorusGeometry(4.2, 0.08, 10, 48),
    new MeshStandardMaterial({
      color: 0x47d7ff,
      emissive: 0x47d7ff,
      emissiveIntensity: 0.36,
      transparent: true,
      opacity: 0.72,
    }),
  );
  selectedRing.rotation.x = Math.PI / 2;
  selectedRing.position.y = 3.3;
  selectedRing.visible = false;
  group.add(selectedRing);

  const statusPanel = new Mesh(
    new BoxGeometry(2.6, 1.1, 0.18),
    new MeshStandardMaterial({
      color: 0x112235,
      transparent: true,
      opacity: 0.94,
      roughness: 0.5,
      metalness: 0.2,
    }),
  );
  statusPanel.position.set(-0.2, 13.2, 2.7);
  group.add(statusPanel);

  const statusPanelEdge = new LineSegments(
    new EdgesGeometry(statusPanel.geometry),
    new LineBasicMaterial({ color: 0x47d7ff, transparent: true, opacity: 0.3 }),
  );
  statusPanelEdge.position.copy(statusPanel.position);
  group.add(statusPanelEdge);

  const reactorCoreMaterial = new MeshStandardMaterial({
    color: 0x24415a,
    metalness: 0.24,
    roughness: 0.42,
    emissive: bayAccent(bay.mode),
    emissiveIntensity: 0.18,
  });
  const reactorCore = new Mesh(new CylinderGeometry(1.06, 1.12, 2.35, 24), reactorCoreMaterial);
  reactorCore.position.set(0, 13.15, 0);
  group.add(reactorCore);

  const reactorCap = new Mesh(
    new SphereGeometry(1.05, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new MeshStandardMaterial({
      color: 0x3e6d8f,
      metalness: 0.28,
      roughness: 0.3,
      emissive: bayAccent(bay.mode),
      emissiveIntensity: 0.14,
    }),
  );
  reactorCap.position.set(0, 14.4, 0);
  group.add(reactorCap);

  const reactorPipe = new Mesh(
    new CylinderGeometry(0.12, 0.12, 2.2, 12),
    new MeshStandardMaterial({
      color: 0x6ca8d2,
      metalness: 0.4,
      roughness: 0.4,
    }),
  );
  reactorPipe.position.set(1.8, 14.05, 0);
  reactorPipe.rotation.z = Math.PI / 2;
  group.add(reactorPipe);

  const reactorGlow = new Mesh(
    new SphereGeometry(1.58, 18, 12),
    new MeshStandardMaterial({
      color: bayAccent(bay.mode),
      emissive: bayAccent(bay.mode),
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.18,
      roughness: 0.2,
    }),
  );
  reactorGlow.position.set(0, 13.15, 0);
  group.add(reactorGlow);

  const separatorGroup = new Group();
  separatorGroup.position.set(0, 8.8, 0);
  if (bay.mode === 'centrifuge') {
    const drum = new Mesh(
      new CylinderGeometry(1.45, 1.45, 1.45, 24),
      new MeshStandardMaterial({
        color: 0x24415a,
        metalness: 0.3,
        roughness: 0.5,
        emissive: 0x122338,
        emissiveIntensity: 0.12,
      }),
    );
    const rotor = new Mesh(
      new TorusGeometry(1.55, 0.14, 10, 28),
      new MeshStandardMaterial({
        color: 0x7fe8ff,
        emissive: 0x7fe8ff,
        emissiveIntensity: 0.45,
      }),
    );
    rotor.rotation.x = Math.PI / 2;
    separatorGroup.add(drum, rotor);
    group.add(separatorGroup);

    const sideBox = new Mesh(
      new BoxGeometry(1.3, 0.9, 1.3),
      new MeshStandardMaterial({
        color: 0x3f5d76,
        metalness: 0.22,
        roughness: 0.5,
        emissive: 0x0e2232,
        emissiveIntensity: 0.14,
      }),
    );
    sideBox.position.set(2.25, -0.1, 0);
    separatorGroup.add(sideBox);

    const separatorRotor = rotor;
    const separatorRotorEdge = new LineSegments(
      new EdgesGeometry(drum.geometry),
      new LineBasicMaterial({ color: 0x8fe6ff, transparent: true, opacity: 0.4 }),
    );
    separatorRotorEdge.rotation.copy(drum.rotation);
    separatorGroup.add(separatorRotorEdge);
    separatorGroup.userData.rotor = separatorRotor;
  } else {
    const shell = new Mesh(
      new BoxGeometry(3.8, 1.8, 2.4),
      new MeshStandardMaterial({
        color: 0x24415a,
        metalness: 0.24,
        roughness: 0.48,
        emissive: 0x0f2537,
        emissiveIntensity: 0.18,
      }),
    );
    const leftTank = createTankGroup();
    leftTank.scale.set(0.72, 0.72, 0.72);
    leftTank.position.set(-1.8, 0.12, 0);
    const rightTank = createTankGroup();
    rightTank.scale.set(0.72, 0.72, 0.72);
    rightTank.position.set(1.8, 0.12, 0);
    const bridge = new Mesh(
      new BoxGeometry(3.3, 0.36, 0.7),
      new MeshStandardMaterial({
        color: 0x6ccff7,
        emissive: 0x6ccff7,
        emissiveIntensity: 0.28,
        transparent: true,
        opacity: 0.9,
      }),
    );
    bridge.position.y = -1.12;
    separatorGroup.add(shell, leftTank, rightTank, bridge);
    group.add(separatorGroup);
  }

  const dryerGroup = new Group();
  dryerGroup.position.set(0, 3.9, 0);
  const dryerBody = new Mesh(
    new BoxGeometry(3.9, 1.85, 2.6),
    new MeshStandardMaterial({
      color: 0x1d3449,
      metalness: 0.22,
      roughness: 0.52,
      emissive: 0x132739,
      emissiveIntensity: 0.16,
    }),
  );
  dryerGroup.add(dryerBody);

  const dryerFan = new Mesh(
    new TorusGeometry(0.68, 0.11, 12, 24),
    new MeshStandardMaterial({
      color: 0x8fe6ff,
      emissive: 0x8fe6ff,
      emissiveIntensity: 0.42,
    }),
  );
  dryerFan.rotation.x = Math.PI / 2;
  dryerFan.position.set(1.48, 0.04, 0.72);
  dryerGroup.add(dryerFan);

  const dryerVent = new Mesh(
    new BoxGeometry(0.35, 0.65, 1.8),
    new MeshStandardMaterial({
      color: 0x47d7ff,
      emissive: 0x47d7ff,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.6,
    }),
  );
  dryerVent.position.set(-1.55, 0.1, 0);
  dryerGroup.add(dryerVent);
  group.add(dryerGroup);

  const utilityGroup = new Group();
  utilityGroup.position.set(0, -0.5, 0);
  const utilityCabinet = new Mesh(
    new BoxGeometry(2.6, 1.5, 1.6),
    new MeshStandardMaterial({
      color: 0x23415c,
      metalness: 0.26,
      roughness: 0.58,
      emissive: 0x0d2031,
      emissiveIntensity: 0.15,
    }),
  );
  utilityGroup.add(utilityCabinet);
  const utilityLamp = new Mesh(
    new SphereGeometry(0.18, 16, 12),
    new MeshBasicMaterial({ color: bayTone(bay.health) }),
  );
  utilityLamp.position.set(1.28, 0.58, 0.6);
  utilityGroup.add(utilityLamp);
  const utilityTank = createTankGroup();
  utilityTank.scale.set(0.5, 0.5, 0.5);
  utilityTank.position.set(-1.8, -0.1, 0.1);
  utilityGroup.add(utilityTank);
  group.add(utilityGroup);

  const summaryPlate = new Mesh(
    new BoxGeometry(2.25, 0.8, 0.16),
    new MeshStandardMaterial({
      color: 0x0f2233,
      metalness: 0.12,
      roughness: 0.5,
      transparent: true,
      opacity: 0.96,
    }),
  );
  summaryPlate.position.set(0, 15.8, 0.3);
  group.add(summaryPlate);

  const summaryEdge = new LineSegments(
    new EdgesGeometry(summaryPlate.geometry),
    new LineBasicMaterial({ color: 0x8fe6ff, transparent: true, opacity: 0.3 }),
  );
  summaryEdge.position.copy(summaryPlate.position);
  group.add(summaryEdge);

  const bayVisual: BayVisual = {
    group,
    frame: shell,
    frameEdge: shellEdges,
    reactorCore,
    reactorCoreMaterial,
    separatorRotor: separatorGroup.userData.rotor,
    dryerFan,
    lamp,
    selectedRing,
    statusPanel,
    highlightMaterial: shellMaterial,
    floorMaterials,
    bayId: bay.id,
  };

  shell.userData.bayId = bay.id;
  shellEdges.userData.bayId = bay.id;
  statusPanel.userData.bayId = bay.id;
  selectedRing.userData.bayId = bay.id;
  pickTargets.push(shell);

  bayVisuals.set(bay.id, bayVisual);
  return bayVisual;
}

function syncBayVisuals() {
  props.bays.forEach((bay) => {
    const visual = bayVisuals.get(bay.id);
    if (!visual) return;
    const frameMaterial = visual.frame.material as MeshStandardMaterial;
    const frameEdgeMaterial = visual.frameEdge.material as LineBasicMaterial;
    const lampMaterial = visual.lamp.material as MeshBasicMaterial;
    const statusMaterial = visual.statusPanel.material as MeshStandardMaterial;
    const reactorMaterial = visual.reactorCoreMaterial;
    const dryerMaterial = visual.dryerFan.material as MeshStandardMaterial;

    const selected = bay.id === props.selectedBayId;
    visual.group.scale.setScalar(selected ? 1.05 : 1);
    visual.selectedRing.visible = selected;
    frameMaterial.color.setHex(bayTone(bay.health));
    frameMaterial.opacity = selected ? 0.42 : 0.28;
    frameEdgeMaterial.color.setHex(selected ? 0x9ef0ff : 0x4ad8ff);
    lampMaterial.color.setHex(bayTone(bay.health));
    reactorMaterial.emissive.setHex(bayAccent(bay.mode));
    reactorMaterial.emissiveIntensity = clamp(0.18 + bay.reactorTemp / 240, 0.2, 0.92);
    dryerMaterial.color.setHex(bayAccent(bay.mode));
    dryerMaterial.emissive.setHex(bayAccent(bay.mode));
    statusMaterial.color.setHex(selected ? 0x18314a : 0x112235);
    statusMaterial.opacity = selected ? 1 : 0.94;
    visual.floorMaterials.forEach((material, floorIndex) => {
      const intensity = floorIndex === 0 ? 0.16 : floorIndex === 1 ? 0.2 : floorIndex === 2 ? 0.24 : 0.18;
      material.emissive.setHex(bay.health === 'alarm' ? 0xff6b6b : bayAccent(bay.mode));
      material.emissiveIntensity = intensity + (selected ? 0.1 : 0);
    });
  });
}

function focusBay(bayId: number) {
  const bayVisual = bayVisuals.get(bayId);
  if (!bayVisual || !camera || !controls) return;

  const target = new Vector3();
  bayVisual.group.getWorldPosition(target);
  controls.target.copy(target);
  const cameraOffset = new Vector3(0, 10, 19);
  camera.position.copy(target.clone().add(cameraOffset));
  camera.lookAt(target);
}

function handlePointerDown(event: PointerEvent) {
  if (!renderer || !camera || !scene || !host.value) return;

  const bounds = host.value.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(pickTargets, true);
  if (intersects.length === 0) return;

  let target: any = intersects[0].object;
  while (target && typeof target.userData?.bayId !== 'number') {
    target = target.parent;
  }

  if (target?.userData?.bayId) {
    emit('selectBay', target.userData.bayId);
    focusBay(target.userData.bayId);
  }
}

function onResize() {
  if (!host.value || !renderer || !camera) return;
  const { width, height } = host.value.getBoundingClientRect();
  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
}

function setupScene() {
  if (!host.value) return;

  scene = new Scene();
  scene.background = new Color(0x08111d);
  scene.fog = new Fog(0x08111d, 28, 72);

  camera = new PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 15, 34);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x08111d, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setSize(host.value.clientWidth, host.value.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.classList.add('absolute', 'inset-0', 'h-full', 'w-full');
  host.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.maxDistance = 52;
  controls.minDistance = 18;
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.target.set(0, 3, 0);
  controls.update();

  const ambient = new AmbientLight(0xffffff, 0.7);
  const hemi = new HemisphereLight(0x71d9ff, 0x04111b, 0.8);
  const key = new DirectionalLight(0xb6f2ff, 1.7);
  key.position.set(12, 22, 18);
  const fill = new DirectionalLight(0x4ad8ff, 0.55);
  fill.position.set(-16, 10, -14);

  scene.add(ambient, hemi, key, fill);

  const floor = new Mesh(
    new PlaneGeometry(120, 60),
    new MeshStandardMaterial({
      color: 0x07121d,
      metalness: 0.15,
      roughness: 0.98,
      transparent: true,
      opacity: 0.98,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -9.2;
  scene.add(floor);

  const floorGrid = new Mesh(
    new PlaneGeometry(120, 60, 24, 12),
    new MeshStandardMaterial({
      color: 0x0b1a29,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    }),
  );
  floorGrid.rotation.x = -Math.PI / 2;
  floorGrid.position.y = -9.15;
  scene.add(floorGrid);

  const walkway = new Mesh(
    new BoxGeometry(70, 0.2, 6.8),
    new MeshStandardMaterial({
      color: 0x0d1d2f,
      emissive: 0x06111b,
      emissiveIntensity: 0.2,
      metalness: 0.15,
      roughness: 0.9,
    }),
  );
  walkway.position.set(0, -6.2, 0);
  scene.add(walkway);

  const guideLine = new Mesh(
    new BoxGeometry(72, 0.04, 0.12),
    new MeshStandardMaterial({
      color: 0x47d7ff,
      emissive: 0x47d7ff,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.55,
    }),
  );
  guideLine.position.set(0, -5.95, 0);
  scene.add(guideLine);

  props.bays.forEach((bay, index) => {
    createBayVisual(bay, index, props.bays.length);
  });

  syncBayVisuals();
  focusBay(props.selectedBayId);

  window.addEventListener('pointerdown', handlePointerDown);
  resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(host.value);
  onResize();
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);
  if (!scene || !camera || !renderer || !controls) return;

  controls.update();

  bayVisuals.forEach((visual, bayId) => {
    const bay = props.bays.find((item) => item.id === bayId);
    if (!bay) return;

    if (visual.separatorRotor) {
      const speed = bay.mode === 'centrifuge' ? bay.separationRpm / 1800 : bay.separationRpm / 2600;
      visual.separatorRotor.rotation.y += 0.02 + speed * 0.12;
    }
    visual.dryerFan.rotation.z += 0.04 + bay.dryerTemp / 900;
    visual.reactorCore.rotation.y += 0.005 + bay.agitatorRpm / 12000;
    const pulse = 0.5 + Math.sin(performance.now() * 0.004 + bay.id) * 0.22;
    visual.lamp.scale.setScalar(0.95 + pulse * 0.14);
    visual.selectedRing.rotation.z += 0.01;
  });

  renderer.render(scene, camera);
}

watch(
  () => props.bays,
  () => {
    syncBayVisuals();
  },
  { deep: true, immediate: true },
);

watch(
  () => props.selectedBayId,
  (bayId) => {
    syncBayVisuals();
    focusBay(bayId);
  },
  { immediate: true },
);

onMounted(() => {
  setupScene();
  animate();
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame);
  window.removeEventListener('pointerdown', handlePointerDown);
  resizeObserver?.disconnect();
  controls?.dispose();
  renderer?.dispose();
  if (host.value && renderer?.domElement && host.value.contains(renderer.domElement)) {
    host.value.removeChild(renderer.domElement);
  }
  bayVisuals.clear();
  pickTargets.splice(0, pickTargets.length);
  scene = null;
  camera = null;
  controls = null;
  renderer = null;
});
</script>
