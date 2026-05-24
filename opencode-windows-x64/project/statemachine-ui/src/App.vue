<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElTag, ElMessage, ElCard, ElSpace, ElMessageBox } from 'element-plus'
import { orderApi } from './api/order'
import type { Order, OrderEvent, OrderState, Transition, StateMachineHistory } from './types'
import StateFlowDiagram from './components/StateFlowDiagram.vue'
import StateHistoryTimeline from './components/StateHistoryTimeline.vue'

const orders = ref<Order[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedOrder = ref<Order | null>(null)
const form = ref({ customerName: '', amount: 0 })
const availableTransitions = ref<Transition[]>([])
const history = ref<StateMachineHistory[]>([])

const stateType = (state: OrderState): '' | 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const types: Record<OrderState, '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
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

const eventLabels: Record<OrderEvent, string> = {
  'CONFIRM': 'Confirm Order',
  'PAY': 'Process Payment',
  'PROCESS': 'Start Processing',
  'SHIP': 'Ship Order',
  'DELIVER': 'Mark Delivered',
  'CANCEL': 'Cancel Order',
  'REFUND': 'Refund Payment'
}

const loadOrders = async () => {
  loading.value = true
  try {
    orders.value = await orderApi.getAllOrders()
  } catch (e) {
    ElMessage.error('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const createOrder = async () => {
  try {
    await orderApi.createOrder(form.value)
    ElMessage.success('Order created successfully')
    dialogVisible.value = false
    form.value = { customerName: '', amount: 0 }
    await loadOrders()
  } catch (e) {
    ElMessage.error('Failed to create order')
  }
}

const selectOrder = async (order: Order) => {
  selectedOrder.value = order
  try {
    const info = await orderApi.getStateMachineInfo(order.id)
    availableTransitions.value = info.availableEvents
    history.value = await orderApi.getOrderHistory(order.id)
  } catch (e) {
    availableTransitions.value = []
    history.value = []
  }
}

const sendEvent = async (event: OrderEvent) => {
  if (!selectedOrder.value) return
  
  const eventLabel = eventLabels[event]
  const confirmAction = event === 'CANCEL' || event === 'REFUND' ? ElMessageBox.confirm : null
  
  if (confirmAction) {
    try {
      await confirmAction(`Are you sure to ${eventLabel.toLowerCase()}?`, 'Confirm Action', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
    } catch {
      return
    }
  }
  
  try {
    const headers: Record<string, any> = {}
    if (event === 'PAY') {
      headers.payment_amount = selectedOrder.value.amount
    }
    
    const res = await orderApi.sendEvent(selectedOrder.value.id, event, headers)
    
    if (res.rejected) {
      ElMessage.warning(`Event rejected: ${res.rejectedReason || 'Guard condition not met'}`)
    } else if (res.success) {
      ElMessage.success(`${eventLabel} - ${res.actionResult || ''}`)
      await selectOrder({ ...selectedOrder.value, state: res.currentState } as Order)
      await loadOrders()
    } else {
      ElMessage.error('Event failed')
    }
  } catch (e) {
    ElMessage.error('Failed to send event')
  }
}

onMounted(loadOrders)
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Spring Statemachine Demo</h1>
        <p class="text-gray-600 mt-1">Order State Management with Persist, Actions, Guards</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Orders Table -->
        <el-card shadow="hover" class="col-span-2">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Orders ({{ orders.length }})</span>
              <el-button type="primary" @click="dialogVisible = true">Create Order</el-button>
            </div>
          </template>
          
          <el-table :data="orders" v-loading="loading" @row-click="selectOrder" stripe highlight-current-row>
            <el-table-column prop="orderNumber" label="Order #" width="150" />
            <el-table-column prop="customerName" label="Customer" />
            <el-table-column prop="amount" label="Amount" width="120">
              <template #default="{ row }">${{ row.amount.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="state" label="State" width="140">
              <template #default="{ row }">
                <el-tag :type="stateType(row.state)">{{ row.state }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="Created" width="180">
              <template #default="{ row }">
                {{ new Date(row.createTime).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- Order Details Panel -->
        <el-card shadow="hover" v-if="selectedOrder">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Order #{{ selectedOrder.orderNumber }}</span>
              <el-tag :type="stateType(selectedOrder.state)">{{ selectedOrder.state }}</el-tag>
            </div>
          </template>
          
          <StateFlowDiagram 
            :current-state="selectedOrder.state" 
            :transitions="availableTransitions"
          />

          <div class="mt-4">
            <h4 class="font-medium mb-3 text-gray-700">Available Actions</h4>
            <el-space wrap>
              <el-button 
                v-for="t in availableTransitions" 
                :key="t.event"
                :type="t.event === 'CANCEL' || t.event === 'REFUND' ? 'danger' : 'primary'"
                size="small"
                @click="sendEvent(t.event)"
              >
                {{ eventLabels[t.event] }}
              </el-button>
            </el-space>
            <p v-if="availableTransitions.length === 0" class="text-gray-500 text-sm">
              <span v-if="selectedOrder.state === 'DELIVERED'">Order completed</span>
              <span v-else-if="selectedOrder.state === 'CANCELLED'">Order cancelled</span>
              <span v-else>No actions available</span>
            </p>
          </div>

          <div class="mt-4 text-sm text-gray-600">
            <div><span class="font-medium">Customer:</span> {{ selectedOrder.customerName }}</div>
            <div><span class="font-medium">Amount:</span> ${{ selectedOrder.amount.toFixed(2) }}</div>
            <div><span class="font-medium">Created:</span> {{ new Date(selectedOrder.createTime).toLocaleString() }}</div>
          </div>
        </el-card>

        <!-- Placeholder -->
        <el-card shadow="hover" v-else class="flex items-center justify-center min-h-48">
          <p class="text-gray-500">Select an order to view details</p>
        </el-card>

        <!-- History Timeline -->
        <el-card shadow="hover" v-if="selectedOrder" class="lg:col-span-2">
          <template #header>
            <span class="font-semibold">State Change History</span>
          </template>
          <StateHistoryTimeline :history="history" />
        </el-card>
      </div>

      <!-- State Machine Info -->
      <el-card shadow="hover" class="mt-6">
        <template #header>
          <span class="font-semibold">State Machine Architecture</span>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-medium text-blue-800 mb-2">StateMachineFactory</h4>
            <p class="text-sm text-blue-600">Each order gets unique state machine instance keyed by order ID for thread safety</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h4 class="font-medium text-green-800 mb-2">Actions</h4>
            <p class="text-sm text-green-600">Execute business logic on transitions: confirm, payment, process, ship, deliver, cancel</p>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <h4 class="font-medium text-orange-800 mb-2">Guards</h4>
            <p class="text-sm text-orange-600">Conditional checks: payment amount, inventory, timeout, cancel eligibility</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Create Order Dialog -->
    <el-dialog v-model="dialogVisible" title="Create New Order" width="400px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="Customer Name">
          <el-input v-model="form.customerName" placeholder="Enter customer name" />
        </el-form-item>
        <el-form-item label="Amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="createOrder">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>