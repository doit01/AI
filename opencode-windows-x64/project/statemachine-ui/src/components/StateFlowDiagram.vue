<script setup lang="ts">
import { computed } from 'vue'
import type { OrderState, OrderEvent, Transition } from '../types'

const props = defineProps<{
  currentState: OrderState
  transitions?: Transition[]
}>()

const states: OrderState[] = ['PENDING', 'CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const stateIndex = computed(() => states.indexOf(props.currentState))

const cancelled = computed(() => props.currentState === 'CANCELLED')

const getStateClass = (state: OrderState) => {
  if (cancelled.value && state !== 'CANCELLED') {
    return 'bg-gray-200 text-gray-500 opacity-50'
  }
  const idx = states.indexOf(state)
  if (state === props.currentState) return 'bg-purple-500 text-white ring-4 ring-purple-300'
  if (idx < stateIndex.value) return 'bg-green-500 text-white'
  return 'bg-gray-200 text-gray-600'
}

const transitions: Array<{ from: OrderState; to: OrderState; event: OrderEvent }> = [
  { from: 'PENDING', to: 'CONFIRMED', event: 'CONFIRM' },
  { from: 'CONFIRMED', to: 'PAID', event: 'PAY' },
  { from: 'PAID', to: 'PROCESSING', event: 'PROCESS' },
  { from: 'PROCESSING', to: 'SHIPPED', event: 'SHIP' },
  { from: 'SHIPPED', to: 'DELIVERED', event: 'DELIVER' },
]

const cancelTransitions = [
  { from: 'PENDING', to: 'CANCELLED', event: 'CANCEL' },
  { from: 'CONFIRMED', to: 'CANCELLED', event: 'CANCEL' },
  { from: 'PAID', to: 'CANCELLED', event: 'REFUND' },
]

const getEventClass = (from: OrderState, event: OrderEvent) => {
  const idx = states.indexOf(from)
  const currentIdx = states.indexOf(props.currentState)
  if (idx <= currentIdx || cancelled.value) return 'text-gray-300'
  return 'text-purple-600'
}
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <h4 class="text-sm font-medium text-gray-700 mb-3">State Flow Diagram</h4>
    
    <!-- Main flow -->
    <div class="flex items-center justify-between gap-1 mb-3">
      <template v-for="(state, idx) in states" :key="state">
        <div class="flex items-center">
          <div class="relative">
            <div 
              :class="['w-20 h-10 rounded-lg flex items-center justify-center font-medium text-xs transition-all', getStateClass(state)]"
            >
              {{ state }}
            </div>
            <div v-if="state === currentState" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          
          <div v-if="idx < states.length - 1" class="flex flex-col items-center mx-1">
            <span :class="['text-[10px] font-medium mb-0.5', getEventClass(state, transitions[idx].event)]">
              {{ transitions[idx].event }}
            </span>
            <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </template>
    </div>

    <!-- Cancel paths -->
    <div class="border-t border-gray-200 pt-3 mt-2">
      <div class="text-xs text-gray-500 mb-2">Cancel/Refund paths:</div>
      <div class="flex items-center gap-4">
        <template v-for="(ct, idx) in cancelTransitions" :key="ct.event">
          <div class="flex items-center text-xs">
            <span :class="['text-gray-400', getEventClass(ct.from, ct.event)]">{{ ct.from }}</span>
            <svg class="w-4 h-4 mx-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <el-tag size="small" type="danger">{{ ct.event }}</el-tag>
          </div>
          <span v-if="idx < cancelTransitions.length - 1" class="text-gray-300 mx-2">|</span>
        </template>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-3 flex items-center gap-4 text-xs text-gray-600">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-purple-500"></div>
        <span>Current</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-green-500"></div>
        <span>Completed</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-gray-200"></div>
        <span>Pending</span>
      </div>
    </div>
  </div>
</template>