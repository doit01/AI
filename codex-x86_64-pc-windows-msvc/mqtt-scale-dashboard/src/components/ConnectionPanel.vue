<template>
  <n-card :bordered="false" class="shadow-sm">
    <template #header>
      <div class="flex items-center gap-2">
        <span class="i-lucide-radio-tower text-brand-600" />
        <span>MQTT 连接</span>
      </div>
    </template>

    <n-form label-placement="top" :model="localConfig">
      <n-form-item label="WebSocket 连接地址">
        <n-input
          v-model:value="localConfig.url"
          placeholder="ws://127.0.0.1:8083/mqtt"
          @keyup.enter="emitConnect"
        />
      </n-form-item>

      <n-grid :cols="4" :x-gap="16" responsive="screen">
        <n-form-item-gi label="协议">
          <n-select v-model:value="localConfig.protocol" :options="protocolOptions" />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="服务器 IP / 域名">
          <n-input v-model:value="localConfig.host" placeholder="127.0.0.1" />
        </n-form-item-gi>
        <n-form-item-gi label="端口">
          <n-input v-model:value="localConfig.port" placeholder="8083" />
        </n-form-item-gi>
        <n-form-item-gi label="路径">
          <n-input v-model:value="localConfig.path" placeholder="/mqtt" />
        </n-form-item-gi>
        <n-form-item-gi :span="3" label="订阅主题">
          <n-input v-model:value="localConfig.topic" placeholder="scale/weight" />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="用户名">
          <n-input v-model:value="localConfig.username" placeholder="可选" />
        </n-form-item-gi>
        <n-form-item-gi :span="2" label="密码">
          <n-input
            v-model:value="localConfig.password"
            placeholder="可选"
            show-password-on="click"
            type="password"
          />
        </n-form-item-gi>
      </n-grid>

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded bg-gray-50 p-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span class="i-lucide-bug" />
            <span>根据 IP/端口生成的地址</span>
          </div>
          <div class="mt-1 break-all font-mono text-sm text-gray-800">{{ previewUrl }}</div>
        </div>
        <n-button secondary size="small" @click="applyPreviewUrl">
          <template #icon>
            <span class="i-lucide-arrow-up" />
          </template>
          使用此地址
        </n-button>
      </div>

      <n-alert v-if="errorMessage" class="mb-4" title="连接错误" type="error">
        {{ errorMessage }}
      </n-alert>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <n-tag :bordered="false" :type="statusType">
          {{ statusText }}
        </n-tag>
        <n-space>
          <n-button :disabled="status === 'connecting'" type="primary" @click="emitConnect">
            <template #icon>
              <span class="i-lucide-plug" />
            </template>
            连接
          </n-button>
          <n-button :disabled="!canDisconnect" @click="$emit('disconnect')">
            <template #icon>
              <span class="i-lucide-unplug" />
            </template>
            断开
          </n-button>
        </n-space>
      </div>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import {
  buildMqttUrl,
  type ConnectionStatus,
  type MqttProtocol,
  type MqttScaleConfig,
} from '@/composables/useMqttScale';

const props = defineProps<{
  config: MqttScaleConfig;
  status: ConnectionStatus;
  errorMessage: string;
}>();

const emit = defineEmits<{
  connect: [config: MqttScaleConfig];
  disconnect: [];
}>();

const localConfig = reactive<MqttScaleConfig>({ ...props.config });

const protocolOptions: Array<{ label: string; value: MqttProtocol }> = [
  { label: 'ws', value: 'ws' },
  { label: 'wss', value: 'wss' },
];

watch(
  () => props.config,
  (nextConfig) => Object.assign(localConfig, nextConfig),
  { deep: true },
);

const previewUrl = computed(() => buildMqttUrl(localConfig));
const canDisconnect = computed(() => ['connected', 'connecting', 'reconnecting', 'error'].includes(props.status));

const statusText = computed(() => {
  const map: Record<ConnectionStatus, string> = {
    idle: '未连接',
    connecting: '连接中',
    connected: '已连接',
    reconnecting: '重连中',
    error: '连接异常',
    closed: '已断开',
  };
  return map[props.status];
});

const statusType = computed(() => {
  if (props.status === 'connected') return 'success';
  if (props.status === 'error') return 'error';
  if (props.status === 'connecting' || props.status === 'reconnecting') return 'warning';
  return 'default';
});

function applyPreviewUrl() {
  localConfig.url = previewUrl.value;
}

function emitConnect() {
  emit('connect', { ...localConfig });
}
</script>
