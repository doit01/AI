<template>
  <div class="concurrency-demo">
    <!-- 标题 -->
    <n-card :bordered="false" class="demo-hero">
      <n-h1 style="margin-bottom: 8px">⏱ 并发控制演示</n-h1>
      <n-text depth="3">
        对比三种并发控制策略在高并发场景下的数据一致性表现
      </n-text>
    </n-card>

    <!-- 方法说明 -->
    <n-grid :cols="3" :x-gap="12" style="margin-bottom: 16px">
      <n-gi>
        <n-card title="❌ 无保护" size="small" :bordered="true">
          <n-text depth="3">直接 read → write，无任何同步机制。高并发下必然出现丢失更新。</n-text>
          <n-tag type="error" size="tiny" style="margin-top: 8px">竞态 · 丢失更新</n-tag>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="🔒 async-mutex" size="small" :bordered="true">
          <n-text depth="3">进程内互斥锁，串行化对同一计数器的操作。同进程安全，多实例失效。</n-text>
          <n-tag type="warning" size="tiny" style="margin-top: 8px">单机 · 进程内串行</n-tag>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="🗄️ 行锁 (FOR UPDATE)" size="small" :bordered="true">
          <n-text depth="3">数据库行级锁 — SELECT ... FOR UPDATE，所有进程/实例共享锁，强一致。</n-text>
          <n-tag type="success" size="tiny" style="margin-top: 8px">分布式 · 强一致</n-tag>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 计数器状态 -->
    <n-card title="📊 计数器状态" style="margin-bottom: 16px">
      <n-grid :cols="4" :x-gap="12">
        <n-gi>
          <n-statistic label="当前值" :value="counterValue" />
        </n-gi>
        <n-gi>
          <n-statistic label="发起请求数" :value="totalRequests" />
        </n-gi>
        <n-gi>
          <n-statistic label="成功" :value="successCount" />
        </n-gi>
        <n-gi>
          <n-statistic
            label="期望值"
            :value="expectedValue"
            :style="expectedValue > 0 && counterValue !== expectedValue ? 'color: #e88080' : ''"
          />
        </n-gi>
      </n-grid>
    </n-card>

    <!-- 操作区 -->
    <n-card title="🎮 操作" style="margin-bottom: 16px">
      <n-space>
        <n-button type="error" :loading="naiveRunning" @click="runTest('naive')">
          ❌ 无保护 10次并发
        </n-button>
        <n-button type="warning" :loading="mutexRunning" @click="runTest('mutex')">
          🔒 Mutex 10次并发
        </n-button>
        <n-button type="primary" :loading="lockedRunning" @click="runTest('locked')">
          🗄️ 行锁 10次并发
        </n-button>
        <n-button quaternary @click="resetCounter" :loading="resetting">
          重置计数器
        </n-button>
      </n-space>
    </n-card>

    <!-- 请求日志 -->
    <n-card title="📝 请求日志" style="margin-bottom: 16px">
      <n-space v-if="!logs.length" justify="center">
        <n-text depth="3">暂无日志，点击上方按钮开始测试</n-text>
      </n-space>
      <n-collapse v-else>
        <n-collapse-item
          v-for="(log, idx) in logs"
          :key="idx"
          :title="`${log.method} #${idx + 1}`"
          :name="String(idx)"
        >
          <n-space vertical>
            <n-text depth="3">方法：{{ log.method === 'naive' ? '无保护' : log.method === 'mutex' ? 'Mutex' : '行锁' }}</n-text>
            <n-text :type="log.success ? 'success' : 'error'">状态：{{ log.success ? '成功' : '失败' }}</n-text>
            <n-text depth="3">结果：{{ log.result }}</n-text>
            <n-text depth="3">耗时：{{ log.duration }}ms</n-text>
          </n-space>
        </n-collapse-item>
      </n-collapse>
    </n-card>

    <!-- 结果对比 -->
    <n-card v-if="summary.length" title="📈 结果对比">
      <n-table :single-line="false">
        <thead>
          <tr>
            <th>测试</th>
            <th>请求数</th>
            <th>成功</th>
            <th>失败</th>
            <th>最终值</th>
            <th>期望值</th>
            <th>一致?</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in summary" :key="s.method">
            <td>{{ s.label }}</td>
            <td>{{ s.total }}</td>
            <td>{{ s.success }}</td>
            <td>{{ s.fail }}</td>
            <td>{{ s.finalValue }}</td>
            <td>{{ s.expected }}</td>
            <td>
              <n-tag :type="s.consistent ? 'success' : 'error'" size="tiny">
                {{ s.consistent ? '✅' : '❌' }}
              </n-tag>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NCard, NCollapse, NCollapseItem, NGrid, NGi, NSpace, NStatistic, NTable, NTag, NText, NH1 } from 'naive-ui'
import { incrementNaive, incrementMutex, incrementLocked, resetCounter as apiReset, getAllCounters } from '../api/concurrency'

const counterValue = ref(0)
const expectedValue = ref(0)
const totalRequests = ref(0)
const successCount = ref(0)

interface LogEntry {
  method: 'naive' | 'mutex' | 'locked'
  success: boolean
  result: string
  duration: number
}

interface SummaryEntry {
  method: string
  label: string
  total: number
  success: number
  fail: number
  finalValue: number
  expected: number
  consistent: boolean
}

const logs = ref<LogEntry[]>([])
const summary = ref<SummaryEntry[]>([])

const naiveRunning = ref(false)
const mutexRunning = ref(false)
const lockedRunning = ref(false)
const resetting = ref(false)

const COUNTER_NAME = 'demo-counter'

async function fetchCounter() {
  try {
    const res: any = await getAllCounters()
    const counters: any[] = res.data ?? res ?? []
    const c = counters.find((c: any) => c.name === COUNTER_NAME)
    if (c) counterValue.value = c.value
  } catch {
    // ignore
  }
}

async function runTest(method: 'naive' | 'mutex' | 'locked') {
  const runningMap = { naive: naiveRunning, mutex: mutexRunning, locked: lockedRunning }
  runningMap[method].value = true
  logs.value = []
  summary.value = []

  const initialValue = counterValue.value
  const CONCURRENT = 10
  totalRequests.value = CONCURRENT
  expectedValue.value = initialValue + CONCURRENT

  const apiMap = { naive: incrementNaive, mutex: incrementMutex, locked: incrementLocked }
  const api = apiMap[method]

  const promises = Array.from({ length: CONCURRENT }, async () => {
    const start = performance.now()
    try {
      await api(COUNTER_NAME)
      const duration = Math.round(performance.now() - start)
      logs.value.push({ method, success: true, result: 'ok', duration })
    } catch (err: any) {
      const duration = Math.round(performance.now() - start)
      logs.value.push({ method, success: false, result: err?.message || String(err), duration })
    }
  })

  await Promise.all(promises)
  runningMap[method].value = false

  const okCount = logs.value.filter((l) => l.success).length
  successCount.value = okCount

  // get final counter value
  await fetchCounter()
  const finalVal = counterValue.value

  // collect summary entries for this method
  summary.value = [
    {
      method,
      label: method === 'naive' ? '无保护' : method === 'mutex' ? 'Mutex' : '行锁',
      total: CONCURRENT,
      success: okCount,
      fail: CONCURRENT - okCount,
      finalValue: finalVal,
      expected: initialValue + CONCURRENT,
      consistent: finalVal === initialValue + CONCURRENT,
    },
  ]
}

async function resetCounter() {
  resetting.value = true
  try {
    await apiReset(COUNTER_NAME)
    counterValue.value = 0
    expectedValue.value = 0
    totalRequests.value = 0
    successCount.value = 0
    logs.value = []
    summary.value = []
    await fetchCounter()
  } catch {
    // ignore
  } finally {
    resetting.value = false
  }
}

// initial fetch
fetchCounter()
</script>

<style scoped>
.concurrency-demo {
  max-width: 960px;
  margin: 0 auto;
}

.demo-hero {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  margin-bottom: 16px;
  border-radius: 8px;
}

.demo-hero :deep(.n-h1),
.demo-hero :deep(.n-text) {
  color: white !important;
}
</style>
