<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, NTree, NButton, NSpace, NTag, NCard, NSpin } from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()
const treeData = ref<any[]>([])
const loading = ref(false)
const selectedNode = ref<any>(null)

const entityInfo = computed(() => {
  if (!selectedNode.value) return null
  return {
    type: selectedNode.value.type,
    label: selectedNode.value.label,
    state: selectedNode.value.state,
    entityId: selectedNode.value.entityId,
    resultType: selectedNode.value.resultType,
  }
})

const availableEvents = computed(() => {
  const info = entityInfo.value
  if (!info) return []
  const state = info.state
  const type = info.type
  if (type === 'project') {
    if (state === 'CREATE') return ['FINISH_PROJECT', 'CANCEL_PROJECT']
    return []
  }
  if (type === 'batch') {
    if (state === 'CREATE') return ['START_PRODUCTION', 'CANCEL_BATCH']
    if (state === 'PRODUCTION') return ['START_RELEASING', 'CANCEL_BATCH']
    if (state === 'RELEASING') return ['COMPLETE_RELEASING', 'CANCEL_BATCH']
    return []
  }
  if (type === 'step') {
    if (state === 'CREATE') return ['EXECUTE']
    if (state === 'SHORT') return ['MARK_EXCEED', 'MARK_SKIP']
    return []
  }
  return []
})

const stateColors: Record<string, string> = {
  CREATE: 'info',
  PRODUCTION: 'warning',
  RELEASING: 'warning',
  FINISH: 'success',
  CANCEL: 'error',
  EXECUTED: 'success',
  SHORT: 'success',
  EXCEED: 'warning',
  SKIP: 'default',
}

async function loadTree() {
  loading.value = true
  try {
    treeData.value = await api.ssm.tree()
  } catch (e: any) {
    msg.error('加载失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

function nodeClick(keys: string[], option: any) {
  selectedNode.value = option
}

async function sendEvent(event: string) {
  if (!selectedNode.value) return
  const { type, entityId } = selectedNode.value
  try {
    if (type === 'project') await api.ssm.sendProjectEvent(entityId, event)
    else if (type === 'batch') await api.ssm.sendBatchEvent(entityId, event)
    else if (type === 'step') await api.ssm.sendStepEvent(entityId, event)
    msg.success('操作成功')
    await loadTree()
  } catch (e: any) {
    msg.error('操作失败: ' + e.message)
  }
}

onMounted(loadTree)
</script>

<template>
  <div class="page-container">
    <h2 class="text-xl font-bold mb-4">状态机演示</h2>
    <NSpin :show="loading">
      <div class="flex gap-4" style="height: calc(100vh - 160px)">
        <NCard title="实体层级" style="width: 320px; overflow: auto">
          <NTree
            :data="treeData"
            :default-expand-all="true"
            :node-props="() => ({ style: 'cursor:pointer' })"
            @update:selected-keys="nodeClick"
          />
        </NCard>
        <NCard title="详情与操作" style="flex: 1; overflow: auto">
          <template v-if="entityInfo">
            <div class="mb-4">
              <p><strong>类型:</strong> {{ entityInfo.type }}</p>
              <p><strong>名称:</strong> {{ entityInfo.label }}</p>
              <p><strong>当前状态:</strong>
                <NTag :type="(stateColors[entityInfo.state] as any) || 'default'">{{ entityInfo.state }}</NTag>
              </p>
              <p v-if="entityInfo.resultType"><strong>执行结果:</strong>
                <NTag :type="(stateColors[entityInfo.resultType] as any) || 'default'">{{ entityInfo.resultType }}</NTag>
              </p>
            </div>
            <div v-if="availableEvents.length">
              <p class="mb-2 font-bold">可用操作:</p>
              <NSpace>
                <NButton v-for="evt in availableEvents" :key="evt" type="primary" @click="sendEvent(evt)">
                  {{ evt }}
                </NButton>
              </NSpace>
            </div>
            <p v-else class="text-gray-400">该实体当前没有可用操作</p>
          </template>
          <p v-else class="text-gray-400">请在左侧选择一个实体</p>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>
