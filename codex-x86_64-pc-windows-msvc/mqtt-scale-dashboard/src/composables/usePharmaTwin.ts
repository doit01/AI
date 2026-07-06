import { computed, onBeforeUnmount, ref } from 'vue';

export type BayMode = 'centrifuge' | 'three-in-one';
export type BayPhase = 'charging' | 'reaction' | 'transfer' | 'separation' | 'drying' | 'discharge';
export type BayHealth = 'running' | 'warning' | 'alarm';

export interface PharmaBay {
  id: number;
  name: string;
  mode: BayMode;
  batchId: string;
  phase: BayPhase;
  health: BayHealth;
  progress: number;
  reactorTemp: number;
  reactorPressure: number;
  agitatorRpm: number;
  separationRpm: number;
  dryerTemp: number;
  vacuum: number;
  yieldKg: number;
  energyKwh: number;
  alarms: string[];
  updatedAt: Date;
}

const phaseLabels: Record<BayPhase, string> = {
  charging: '投料',
  reaction: '反应',
  transfer: '转运',
  separation: '离心 / 三合一',
  drying: '干燥',
  discharge: '出料',
};

const phaseOrder: BayPhase[] = ['charging', 'reaction', 'transfer', 'separation', 'drying', 'discharge'];
const phaseThresholds = [18, 48, 60, 79, 95, 100];
const phaseSpeeds: Record<BayPhase, number> = {
  charging: 1.3,
  reaction: 1.8,
  transfer: 1.1,
  separation: 1.5,
  drying: 1.2,
  discharge: 1.0,
};

const phaseProfiles: Record<
  BayPhase,
  {
    temp: [number, number];
    pressure: [number, number];
    agitator: [number, number];
    separation: [number, number];
    dryerTemp: [number, number];
    vacuum: [number, number];
    energy: [number, number];
  }
> = {
  charging: {
    temp: [72, 88],
    pressure: [0.16, 0.3],
    agitator: [24, 44],
    separation: [0, 0],
    dryerTemp: [48, 60],
    vacuum: [0.1, 0.18],
    energy: [10, 16],
  },
  reaction: {
    temp: [114, 140],
    pressure: [0.48, 0.74],
    agitator: [58, 84],
    separation: [0, 0],
    dryerTemp: [58, 72],
    vacuum: [0.16, 0.22],
    energy: [22, 34],
  },
  transfer: {
    temp: [96, 118],
    pressure: [0.32, 0.5],
    agitator: [22, 38],
    separation: [0, 0],
    dryerTemp: [60, 72],
    vacuum: [0.18, 0.26],
    energy: [14, 22],
  },
  separation: {
    temp: [66, 88],
    pressure: [0.22, 0.42],
    agitator: [26, 42],
    separation: [1800, 3200],
    dryerTemp: [66, 78],
    vacuum: [0.4, 0.58],
    energy: [24, 38],
  },
  drying: {
    temp: [74, 104],
    pressure: [0.1, 0.22],
    agitator: [0, 12],
    separation: [0, 0],
    dryerTemp: [82, 118],
    vacuum: [0.72, 0.96],
    energy: [20, 32],
  },
  discharge: {
    temp: [52, 68],
    pressure: [0.08, 0.16],
    agitator: [0, 10],
    separation: [0, 0],
    dryerTemp: [54, 66],
    vacuum: [0.12, 0.2],
    energy: [8, 12],
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(current: number, target: number, alpha: number) {
  return current + (target - current) * alpha;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeBatchId(index: number, cycle: number) {
  return `B-${String(index).padStart(2, '0')}-${String(cycle).padStart(3, '0')}`;
}

function phaseFromProgress(progress: number): BayPhase {
  for (let index = 0; index < phaseThresholds.length; index += 1) {
    if (progress < phaseThresholds[index]) {
      return phaseOrder[index];
    }
  }
  return 'discharge';
}

function getPhaseLabel(phase: BayPhase) {
  return phaseLabels[phase];
}

function createBay(index: number): PharmaBay {
  const mode: BayMode = index % 2 === 0 ? 'three-in-one' : 'centrifuge';
  return {
    id: index,
    name: `Bay ${index}`,
    mode,
    batchId: makeBatchId(index, 1),
    phase: index === 1 ? 'reaction' : index === 2 ? 'separation' : index === 3 ? 'drying' : 'charging',
    health: 'running',
    progress: 12 + index * 7,
    reactorTemp: randomBetween(78, 124),
    reactorPressure: randomBetween(0.18, 0.52),
    agitatorRpm: randomBetween(24, 72),
    separationRpm: mode === 'centrifuge' ? randomBetween(1800, 2600) : randomBetween(900, 1400),
    dryerTemp: randomBetween(58, 92),
    vacuum: randomBetween(0.16, 0.52),
    yieldKg: randomBetween(620, 1180),
    energyKwh: randomBetween(120, 260),
    alarms: [],
    updatedAt: new Date(),
  };
}

function buildInitialBays() {
  return [1, 2, 3, 4, 5].map((index) => createBay(index));
}

export function usePharmaTwin() {
  const bays = ref<PharmaBay[]>(buildInitialBays());
  const updatedAt = ref(new Date());
  const logs = ref<string[]>([
    '[08:15:24] 车间孪生启动，5 个 bay 已加载。',
    '[08:16:01] Bay 02 进入三合一分离阶段。',
    '[08:16:18] Bay 04 反应釜升温完成，准备转运。',
  ]);

  let cycleCounter = 1;

  function pushLog(message: string) {
    const stamp = new Intl.DateTimeFormat('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());

    logs.value = [`[${stamp}] ${message}`, ...logs.value].slice(0, 8);
  }

  function updateBay(bay: PharmaBay) {
    const previousPhase = bay.phase;
    const previousHealth = bay.health;

    const step = phaseSpeeds[bay.phase] * (0.7 + Math.random() * 0.7);
    bay.progress += step;

    if (bay.progress >= 100) {
      bay.progress -= 100;
      bay.yieldKg += randomBetween(62, 96);
      bay.energyKwh += randomBetween(6, 16);
      bay.batchId = makeBatchId(bay.id, ++cycleCounter);
      pushLog(`${bay.name} 完成一个批次，切换到新批号 ${bay.batchId}。`);
    }

    bay.phase = phaseFromProgress(bay.progress);

    const profile = phaseProfiles[bay.phase];
    const modeBias = bay.mode === 'centrifuge' ? 1 : 0.96;

    bay.reactorTemp = lerp(
      bay.reactorTemp,
      randomBetween(profile.temp[0], profile.temp[1]) * modeBias,
      0.18,
    );
    bay.reactorPressure = lerp(bay.reactorPressure, randomBetween(profile.pressure[0], profile.pressure[1]), 0.18);
    bay.agitatorRpm = lerp(bay.agitatorRpm, randomBetween(profile.agitator[0], profile.agitator[1]), 0.22);
    bay.separationRpm = lerp(
      bay.separationRpm,
      bay.mode === 'centrifuge'
        ? randomBetween(profile.separation[0], profile.separation[1])
        : randomBetween(profile.separation[0] * 0.7, profile.separation[1] * 0.7),
      0.2,
    );
    bay.dryerTemp = lerp(bay.dryerTemp, randomBetween(profile.dryerTemp[0], profile.dryerTemp[1]), 0.16);
    bay.vacuum = lerp(bay.vacuum, randomBetween(profile.vacuum[0], profile.vacuum[1]), 0.2);
    bay.energyKwh += randomBetween(profile.energy[0], profile.energy[1]) * 0.05;

    const alarms: string[] = [];
    if (bay.reactorTemp > 136) alarms.push('釜温偏高');
    if (bay.reactorPressure > 0.72) alarms.push('釜压偏高');
    if (bay.vacuum < 0.28 && bay.phase === 'drying') alarms.push('真空波动');
    if (bay.separationRpm > 3000 && bay.mode === 'centrifuge') alarms.push('离心机高转速');
    bay.alarms = alarms;

    if (alarms.length > 0) {
      bay.health = alarms.length > 1 || bay.reactorTemp > 139 ? 'alarm' : 'warning';
    } else if (bay.reactorTemp > 130 || bay.vacuum < 0.36) {
      bay.health = 'warning';
    } else {
      bay.health = 'running';
    }

    bay.updatedAt = new Date();

    if (bay.phase !== previousPhase) {
      pushLog(`${bay.name} 进入 ${getPhaseLabel(bay.phase)} 阶段。`);
    }

    if (bay.health !== previousHealth) {
      const suffix = bay.alarms.length > 0 ? `，告警：${bay.alarms.join(' / ')}` : '';
      pushLog(`${bay.name} 状态切换为 ${bay.health === 'alarm' ? '告警' : '预警'}${suffix}。`);
    }
  }

  function tick() {
    bays.value.forEach(updateBay);
    updatedAt.value = new Date();
  }

  const timer = window.setInterval(tick, 1800);

  onBeforeUnmount(() => {
    window.clearInterval(timer);
  });

  const totalYieldKg = computed(() => bays.value.reduce((sum, bay) => sum + bay.yieldKg, 0));
  const totalEnergyKwh = computed(() => bays.value.reduce((sum, bay) => sum + bay.energyKwh, 0));
  const averageReactionTemp = computed(
    () => bays.value.reduce((sum, bay) => sum + bay.reactorTemp, 0) / bays.value.length,
  );
  const averageVacuum = computed(() => bays.value.reduce((sum, bay) => sum + bay.vacuum, 0) / bays.value.length);
  const activeBayCount = computed(() => bays.value.filter((bay) => bay.health === 'running').length);
  const warningBayCount = computed(() => bays.value.filter((bay) => bay.health === 'warning').length);
  const alarmBayCount = computed(() => bays.value.filter((bay) => bay.health === 'alarm').length);
  const separationBayCount = computed(() => bays.value.filter((bay) => bay.phase === 'separation').length);

  return {
    bays,
    logs,
    updatedAt,
    totalYieldKg,
    totalEnergyKwh,
    averageReactionTemp,
    averageVacuum,
    activeBayCount,
    warningBayCount,
    alarmBayCount,
    separationBayCount,
  };
}

export function getBayModeLabel(mode: BayMode) {
  return mode === 'centrifuge' ? '离心机' : '三合一';
}

export function getBayPhaseLabel(phase: BayPhase) {
  return phaseLabels[phase];
}
