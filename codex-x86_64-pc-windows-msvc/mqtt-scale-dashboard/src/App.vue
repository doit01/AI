<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <main class="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div class="mx-auto flex max-w-7xl flex-col gap-4">
        <section class="hero-panel overflow-hidden rounded-[32px] border border-white/10 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.32)] md:p-6">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(71,215,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,255,170,0.12),transparent_24%)]" />
          <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-stretch">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div class="text-xs uppercase tracking-[0.42em] text-cyan-200/70">Pharma factory digital twin</div>
                  <h1 class="mt-3 text-3xl font-700 tracking-[0.02em] text-white md:text-5xl">
                    制药车间数字孪生
                  </h1>
                  <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                    当前演示包含 1 个车间、5 个 bay，每个 bay 具备 4 层结构，顶层为反应釜，
                    中层为离心机或三合一，下一层为干燥器，底层为公用工程与控制单元。
                  </p>
                </div>
                <div class="rounded-2xl border border-cyan-300/15 bg-black/20 px-4 py-3 backdrop-blur">
                  <div class="text-xs uppercase tracking-[0.32em] text-white/45">更新时间</div>
                  <div class="mt-2 font-mono text-sm text-cyan-100">{{ formattedUpdatedAt }}</div>
                </div>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div class="stat-card">
                  <div class="stat-label">运行 Bay</div>
                  <div class="stat-value">{{ activeBayCount }}</div>
                  <div class="stat-caption">运行中</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">平均釜温</div>
                  <div class="stat-value">{{ averageReactionTemp.toFixed(1) }}</div>
                  <div class="stat-caption">°C</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">总产出</div>
                  <div class="stat-value">{{ totalYieldKg.toFixed(0) }}</div>
                  <div class="stat-caption">kg</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">活跃告警</div>
                  <div class="stat-value">{{ alarmBayCount }}</div>
                  <div class="stat-caption">{{ warningBayCount }} 个预警</div>
                </div>
              </div>
            </div>

            <aside class="w-full rounded-[28px] border border-white/10 bg-black/25 p-4 backdrop-blur-md xl:w-[340px]">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs uppercase tracking-[0.3em] text-white/45">本班次</div>
                  <div class="mt-2 text-3xl font-700 text-white">{{ selectedBay?.batchId || 'B-00-000' }}</div>
                </div>
                <n-tag :bordered="false" :type="plantStateType" size="large">
                  {{ plantStateText }}
                </n-tag>
              </div>

              <div class="mt-4 grid gap-3">
                <div class="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <div class="text-xs text-white/45">总能耗</div>
                  <div class="mt-1 text-xl font-600 text-white">{{ totalEnergyKwh.toFixed(1) }} kWh</div>
                </div>
                <div class="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <div class="text-xs text-white/45">平均真空度</div>
                  <div class="mt-1 text-xl font-600 text-white">{{ averageVacuum.toFixed(2) }}</div>
                </div>
                <div class="rounded-2xl border border-white/8 bg-white/5 p-3">
                  <div class="text-xs text-white/45">分离中 Bay</div>
                  <div class="mt-1 text-xl font-600 text-white">{{ separationBayCount }}</div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section class="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div class="space-y-4">
            <n-card :bordered="false" class="glass-card overflow-hidden">
              <template #header>
                <div class="flex items-center gap-2">
                  <span class="i-lucide-layers-3 text-cyan-300" />
                  <span>3D 车间视图</span>
                </div>
              </template>
              <PharmaTwinScene
                :bays="bays"
                :selected-bay-id="selectedBayId"
                @select-bay="setSelectedBay"
              />
            </n-card>

            <n-card :bordered="false" class="glass-card">
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="i-lucide-grid-2x2 text-cyan-300" />
                    <span>5 个 Bay 总览</span>
                  </div>
                  <div class="text-xs text-white/45">点击任意卡片或 3D bay 进行聚焦</div>
                </div>
              </template>

              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <button
                  v-for="bay in bays"
                  :key="bay.id"
                  class="bay-card text-left"
                  :class="selectedBayId === bay.id ? 'bay-card--active' : ''"
                  type="button"
                  @click="setSelectedBay(bay.id)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="text-sm font-600 text-white">{{ bay.name }}</div>
                      <div class="mt-1 text-xs text-white/50">{{ getBayModeLabel(bay.mode) }}</div>
                    </div>
                    <n-tag :bordered="false" size="small" :type="phaseTagType(bay.phase)">
                      {{ getBayPhaseLabel(bay.phase) }}
                    </n-tag>
                  </div>

                  <div class="mt-3">
                    <n-progress
                      :height="8"
                      :percentage="Math.round(bay.progress)"
                      :rail-color="'rgba(255,255,255,0.08)'"
                      :color="bay.health === 'alarm' ? '#ff6b6b' : bay.health === 'warning' ? '#ffc857' : '#47d7ff'"
                      round
                    />
                  </div>

                  <div class="mt-3 flex items-center justify-between text-xs text-white/60">
                    <span>{{ bay.batchId }}</span>
                    <span>{{ bay.reactorTemp.toFixed(1) }}°C</span>
                  </div>
                  <div class="mt-2 flex items-center justify-between text-xs text-white/50">
                    <span>真空 {{ bay.vacuum.toFixed(2) }}</span>
                    <span>产出 {{ bay.yieldKg.toFixed(0) }} kg</span>
                  </div>
                </button>
              </div>
            </n-card>
          </div>

          <div class="space-y-4">
            <n-card :bordered="false" class="glass-card">
              <template #header>
                <div class="flex items-center gap-2">
                  <span class="i-lucide-activity text-cyan-300" />
                  <span>当前 bay 详情</span>
                </div>
              </template>

              <div v-if="selectedBay" class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="text-sm text-white/50">{{ selectedBay.name }}</div>
                    <div class="mt-1 text-2xl font-700 text-white">{{ getBayModeLabel(selectedBay.mode) }}</div>
                  </div>
                  <n-tag :bordered="false" :type="healthTagType(selectedBay.health)">
                    {{ healthText(selectedBay.health) }}
                  </n-tag>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="metric-card">
                    <div class="metric-label">阶段</div>
                    <div class="metric-value">{{ getBayPhaseLabel(selectedBay.phase) }}</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">进度</div>
                    <div class="metric-value">{{ Math.round(selectedBay.progress) }}%</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">釜温</div>
                    <div class="metric-value">{{ selectedBay.reactorTemp.toFixed(1) }}°C</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">釜压</div>
                    <div class="metric-value">{{ selectedBay.reactorPressure.toFixed(2) }} MPa</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">离心 / 旋转</div>
                    <div class="metric-value">{{ selectedBay.separationRpm.toFixed(0) }} rpm</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">干燥温度</div>
                    <div class="metric-value">{{ selectedBay.dryerTemp.toFixed(1) }}°C</div>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl border border-white/8 bg-white/5 p-3">
                    <div class="text-xs text-white/45">告警项</div>
                    <div v-if="selectedBay.alarms.length === 0" class="mt-2 text-sm text-white/80">当前无告警</div>
                    <div v-else class="mt-2 flex flex-wrap gap-2">
                      <n-tag v-for="alarm in selectedBay.alarms" :key="alarm" :bordered="false" type="warning">
                        {{ alarm }}
                      </n-tag>
                    </div>
                  </div>
                  <div class="rounded-2xl border border-white/8 bg-white/5 p-3">
                    <div class="text-xs text-white/45">最后更新</div>
                    <div class="mt-2 text-sm text-white/80">{{ formatDate(selectedBay.updatedAt) }}</div>
                  </div>
                </div>
              </div>
            </n-card>

            <n-card :bordered="false" class="glass-card">
              <template #header>
                <div class="flex items-center gap-2">
                  <span class="i-lucide-scroll-text text-cyan-300" />
                  <span>工艺日志</span>
                </div>
              </template>

              <div class="space-y-3">
                <div
                  v-for="item in logs"
                  :key="item"
                  class="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm leading-6 text-slate-200"
                >
                  {{ item }}
                </div>
              </div>
            </n-card>
          </div>
        </section>
      </div>
    </main>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui';
import { computed, ref } from 'vue';
import PharmaTwinScene from '@/components/PharmaTwinScene.vue';
import {
  getBayModeLabel,
  getBayPhaseLabel,
  type BayHealth,
  type BayPhase,
  usePharmaTwin,
} from '@/composables/usePharmaTwin';

const {
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
} = usePharmaTwin();

const selectedBayId = ref(1);

const selectedBay = computed(() => bays.value.find((bay) => bay.id === selectedBayId.value) ?? bays.value[0] ?? null);

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#47d7ff',
    primaryColorHover: '#79e4ff',
    primaryColorPressed: '#1e9fc8',
    infoColor: '#69f0ae',
    warningColor: '#ffc857',
    errorColor: '#ff6b6b',
    borderRadius: '16px',
  },
  Card: {
    color: 'rgba(7, 17, 29, 0.74)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  Tag: {
    colorBordered: 'rgba(255,255,255,0.08)',
  },
};

const formattedUpdatedAt = computed(() => formatDate(updatedAt.value));

const plantStateType = computed(() => {
  if (alarmBayCount.value > 0) return 'error';
  if (warningBayCount.value > 0) return 'warning';
  return 'success';
});

const plantStateText = computed(() => {
  if (alarmBayCount.value > 0) return '存在告警';
  if (warningBayCount.value > 0) return '局部预警';
  return '稳定运行';
});

function setSelectedBay(bayId: number) {
  selectedBayId.value = bayId;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function healthText(health: BayHealth) {
  if (health === 'alarm') return '告警';
  if (health === 'warning') return '预警';
  return '运行中';
}

function healthTagType(health: BayHealth) {
  if (health === 'alarm') return 'error';
  if (health === 'warning') return 'warning';
  return 'success';
}

function phaseTagType(phase: BayPhase) {
  if (phase === 'reaction' || phase === 'drying') return 'warning';
  if (phase === 'separation') return 'info';
  return 'success';
}
</script>
