<template>
  <n-card :bordered="false" class="shadow-sm">
    <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
      <section class="min-w-0">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="i-lucide-gauge" />
          <span>当前读数</span>
        </div>
        <div class="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
          <span class="font-mono text-6xl font-700 leading-none text-gray-950 md:text-7xl">{{ value }}</span>
          <span class="pb-2 text-2xl font-600 text-gray-500">{{ reading?.unit || 'kg' }}</span>
        </div>
        <p class="mt-4 break-all font-mono text-sm text-gray-500">
          {{ reading?.raw || '等待电子秤上报数据' }}
        </p>
      </section>

      <section class="grid content-start gap-3 rounded bg-gray-50 p-4">
        <div>
          <div class="text-xs text-gray-500">主题</div>
          <div class="mt-1 break-all font-mono text-sm text-gray-800">{{ reading?.topic || '-' }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">接收时间</div>
          <div class="mt-1 font-mono text-sm text-gray-800">{{ receivedAt }}</div>
        </div>
      </section>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ScaleReading } from '@/composables/useMqttScale';

const props = defineProps<{
  value: string;
  reading: ScaleReading | null;
}>();

const receivedAt = computed(() => {
  if (!props.reading) {
    return '-';
  }

  return props.reading.receivedAt.toLocaleString('zh-CN', { hour12: false });
});
</script>
