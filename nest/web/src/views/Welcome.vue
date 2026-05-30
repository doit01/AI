<template>
  <div class="welcome">
    <!-- Hero -->
    <n-card class="hero-card" :bordered="false">
      <n-h1 style="margin-bottom: 8px">PMS 权限管理系统</n-h1>
      <n-text depth="3" style="font-size: 16px">
        NestJS + Prisma + Vue 3 + Naive UI — 全栈教学示例项目
      </n-text>
      <div style="margin-top: 16px">
        <n-tag type="info" style="margin-right: 8px">NestJS 11</n-tag>
        <n-tag type="success" style="margin-right: 8px">Prisma 7</n-tag>
        <n-tag type="warning" style="margin-right: 8px">Vue 3</n-tag>
        <n-tag type="primary" style="margin-right: 8px">Naive UI</n-tag>
        <n-tag type="error">TypeScript</n-tag>
      </div>
    </n-card>

    <!-- 项目统计 (从 API 加载) -->
    <n-grid :cols="4" :x-gap="12" style="margin-bottom: 16px">
      <n-gi>
        <n-card class="stat-card" @click="activeSection = groups[0]?.category ?? ''">
          <n-statistic :value="groups.length" title="技术分类" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card" @click="activeSection = 'nestjs'">
          <n-statistic :value="totalItems" title="知识条目" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card" @click="activeSection = 'prisma'">
          <n-statistic :value="groupCount('prisma')" title="数据库模型" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card class="stat-card" @click="activeSection = 'patterns'">
          <n-statistic :value="groupCount('patterns')" title="设计模式" />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 加载中 -->
    <n-card v-if="loading" :bordered="true" style="margin-bottom: 16px">
      <n-spin size="large" style="display: flex; justify-content: center; padding: 40px" />
    </n-card>

    <!-- 技术知识 Tabs (从数据库加载) -->
    <n-card v-else-if="groups.length" :bordered="true" style="margin-bottom: 16px">
      <n-tabs v-model:value="activeSection" type="line" animated>
        <n-tab-pane
          v-for="group in groups"
          :key="group.category"
          :name="group.category"
          :tab="(group.icon || '📘') + ' ' + group.label"
        >
          <n-collapse>
            <n-collapse-item
              v-for="item in group.items"
              :key="item.id"
              :title="item.title"
              :name="String(item.id)"
            >
              <div class="knowledge-content" v-html="item.content || '暂无详细内容'"></div>
              <div v-if="item.tags" style="margin-top: 8px">
                <n-tag
                  v-for="tag in item.tags.split(',')"
                  :key="tag"
                  size="tiny"
                  style="margin-right: 4px"
                >{{ tag.trim() }}</n-tag>
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 快速开始 -->
    <n-card title="🚀 快速开始" :bordered="true">
      <n-steps :current="3" :status="'finish'">
        <n-step title="安装依赖" description="pnpm install" />
        <n-step title="启动后端" description="pnpm --filter @nest/server dev" />
        <n-step title="启动前端" description="pnpm --filter @nest/web dev" />
      </n-steps>
      <n-collapse style="margin-top: 16px">
        <n-collapse-item title="开发命令速查" name="commands">
          <n-table :single-line="false">
            <thead>
              <tr><th>命令</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td><n-tag>pnpm install</n-tag></td><td>安装所有包依赖</td></tr>
              <tr><td><n-tag>pnpm --filter @nest/server dev</n-tag></td><td>启动后端 (端口 3000)</td></tr>
              <tr><td><n-tag>pnpm --filter @nest/web dev</n-tag></td><td>启动前端 (端口 5173)</td></tr>
              <tr><td><n-tag>pnpm prisma:generate</n-tag></td><td>生成 Prisma Client 类型</td></tr>
              <tr><td><n-tag>pnpm prisma:migrate</n-tag></td><td>创建数据库迁移</td></tr>
              <tr><td><n-tag>pnpm prisma:seed</n-tag></td><td>填充种子数据</td></tr>
            </tbody>
          </n-table>
        </n-collapse-item>
      </n-collapse>
    </n-card>

    <!-- 署名 -->
    <n-p style="text-align: center; margin-top: 32px" depth="3">
      详细技术文档见
      <n-a href="/docs/TECH_STACK.md" target="_blank">docs/TECH_STACK.md</n-a>
      ｜
      知识库数据
      <n-a @click="refresh">点此刷新</n-a>
    </n-p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NTag, NA, NCollapse, NCollapseItem, NTable, NSteps, NStep,
  NStatistic, NCard, NGrid, NGi, NH1, NText, NP, NTabs, NTabPane,
  NSpin,
} from 'naive-ui'
import { getKnowledge } from '../api/knowledge'
import type { KnowledgeGroup } from '@nest/shared'

const activeSection = ref('')

const groups = ref<KnowledgeGroup[]>([])
const loading = ref(true)

const totalItems = computed(() => groups.value.reduce((sum, g) => sum + g.items.length, 0))

function groupCount(category: string) {
  const g = groups.value.find((g) => g.category === category)
  return g?.items.length ?? 0
}

async function refresh() {
  loading.value = true
  try {
    const res: any = await getKnowledge()
    groups.value = res.data ?? res ?? []
    if (groups.value.length && !activeSection.value) {
      activeSection.value = groups.value[0].category
    }
  } catch {
    groups.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => refresh())
</script>

<style scoped>
.welcome {
  max-width: 960px;
  margin: 0 auto;
}

.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 16px;
  border-radius: 8px;
}

.hero-card :deep(.n-card-header) {
  color: white;
}

.hero-card :deep(.n-h1),
.hero-card :deep(.n-text) {
  color: white !important;
}

.hero-card :deep(.n-tag) {
  backdrop-filter: blur(4px);
}

.stat-card {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card :deep(.n-card__content) {
  display: flex;
  justify-content: center;
}

.knowledge-content {
  line-height: 1.7;
  font-size: 14px;
}

.knowledge-content :deep(code) {
  background: #f0f0f0;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 13px;
}

.knowledge-content :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
}
</style>
