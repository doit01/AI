<template>
  <n-card :bordered="false" class="shadow-sm">
    <template #header>
      <div class="flex items-center gap-2">
        <span class="i-lucide-list-tree text-brand-600" />
        <span>最近消息</span>
      </div>
    </template>

    <n-empty v-if="messages.length === 0" description="暂无消息" />
    <n-data-table v-else :columns="columns" :data="rows" :pagination="false" size="small" />
  </n-card>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { NText, type DataTableColumns } from 'naive-ui';
import type { ScaleReading } from '@/composables/useMqttScale';

const props = defineProps<{
  messages: ScaleReading[];
}>();

const rows = computed(() =>
  props.messages.map((message, index) => ({
    id: `${message.receivedAt.getTime()}-${index}`,
    time: message.receivedAt.toLocaleTimeString('zh-CN', { hour12: false }),
    value: message.value === null ? '-' : `${message.value} ${message.unit}`,
    raw: message.raw,
  })),
);

const columns: DataTableColumns<(typeof rows.value)[number]> = [
  { title: '时间', key: 'time', width: 110 },
  { title: '读数', key: 'value', width: 120 },
  {
    title: '原始内容',
    key: 'raw',
    render(row) {
      return h(
        NText,
        {
          code: true,
          class: 'break-all whitespace-normal',
        },
        { default: () => row.raw },
      );
    },
  },
];
</script>
