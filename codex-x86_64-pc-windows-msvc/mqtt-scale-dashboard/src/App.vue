<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <main class="min-h-screen bg-gray-100 text-gray-900">
        <div class="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 class="m-0 text-3xl font-700 tracking-normal">MQTT 电子秤读数</h1>
              <p class="m-0 mt-2 text-gray-600">通过 WebSocket 订阅 MQTT 主题并实时显示重量数据。</p>
            </div>
            <n-tag :bordered="false" size="large" :type="isConnected ? 'success' : 'default'">
              {{ isConnected ? '实时接收' : '未接收' }}
            </n-tag>
          </header>

          <div class="grid gap-4">
            <connection-panel
              :config="config"
              :error-message="errorMessage"
              :status="status"
              @connect="handleConnect"
              @disconnect="disconnect"
            />

            <n-alert v-if="errorMessage" closable title="MQTT 错误" type="error">
              <div class="grid gap-1">
                <span>{{ errorMessage }}</span>
                <span class="break-all font-mono text-xs">URL: {{ connectionUrl }}</span>
              </div>
            </n-alert>

            <scale-display :reading="currentReading" :value="latestDisplay" />
            <message-log :messages="messages" />
          </div>
        </div>
      </main>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui';
import ConnectionPanel from '@/components/ConnectionPanel.vue';
import MessageLog from '@/components/MessageLog.vue';
import ScaleDisplay from '@/components/ScaleDisplay.vue';
import { type MqttScaleConfig, useMqttScale } from '@/composables/useMqttScale';

const {
  config,
  status,
  errorMessage,
  currentReading,
  messages,
  connectionUrl,
  isConnected,
  latestDisplay,
  connect,
  disconnect,
} = useMqttScale();

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#059669',
    primaryColorHover: '#10b981',
    primaryColorPressed: '#047857',
    borderRadius: '8px',
  },
};

function handleConnect(nextConfig: MqttScaleConfig) {
  connect(nextConfig);
}
</script>
