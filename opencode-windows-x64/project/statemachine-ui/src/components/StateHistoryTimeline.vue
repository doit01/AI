<script setup lang="ts">
import { computed } from 'vue'
import type { StateMachineHistory, OrderState } from '../types'
import { ElTimeline, ElTimelineItem, ElTag } from 'element-plus'

const props = defineProps<{
  history: StateMachineHistory[]
}>()

const stateType = (state: OrderState) => {
  const types: Record<OrderState, string> = {
    'PENDING': 'warning',
    'CONFIRMED': 'primary',
    'PAID': 'info',
    'PROCESSING': 'warning',
    'SHIPPED': 'primary',
    'DELIVERED': 'success',
    'CANCELLED': 'danger'
  }
  return types[state] || 'info'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

const eventLabel = (event: string | null) => {
  if (!event) return 'Init'
  const labels: Record<string, string> = {
    'CONFIRM': 'Order Confirmed',
    'PAY': 'Payment Received',
    'PROCESS': 'Processing Started',
    'SHIP': 'Order Shipped',
    'DELIVER': 'Delivered',
    'CANCEL': 'Cancelled',
    'REFUND': 'Refunded'
  }
  return labels[event] || event
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h4 class="font-semibold text-gray-800 mb-4">State Change History</h4>
    
    <el-timeline v-if="history.length > 0">
      <el-timeline-item
        v-for="(item, idx) in history"
        :key="item.id"
        :timestamp="formatTime(item.createTime)"
        placement="top"
        :type="item.result ? 'success' : 'danger'"
      >
        <div class="flex items-center gap-2 mb-2">
          <el-tag :type="stateType(item.toState)" size="small">
            {{ item.toState }}
          </el-tag>
          <span class="text-sm text-gray-600">{{ eventLabel(item.event) }}</span>
        </div>
        <div class="text-xs text-gray-500">
          <span v-if="item.action">{{ item.action }}</span>
          <span v-else>Transition</span>
          <span v-if="item.fromState" class="ml-2">from {{ item.fromState }}</span>
        </div>
        <div v-if="!item.result" class="text-xs text-red-500 mt-1">
          Error: {{ item.errorMessage }}
        </div>
      </el-timeline-item>
    </el-timeline>
    
    <div v-else class="text-gray-500 text-sm">
      No state changes recorded yet
    </div>
  </div>
</template>