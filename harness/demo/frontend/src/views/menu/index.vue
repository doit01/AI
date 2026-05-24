<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useMessage, NButton, NModal, NForm, NFormItem, NInput,
  NInputNumber, NTree, NCard
} from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()
const treeData = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', path: '', component: '', icon: '', sort: 1, parentId: null as number | null })
const selectedMenu = ref<any>(null)

async function loadTree() {
  loading.value = true
  try {
    treeData.value = await api.menus.tree()
  } finally {
    loading.value = false
  }
}

function openCreate(parentId: number | null) {
  editingId.value = null
  form.value = { name: '', path: '', component: '', icon: '', sort: 1, parentId }
  showModal.value = true
}

function openEdit(menu: any) {
  editingId.value = menu.id
  form.value = { name: menu.name, path: menu.path, component: menu.component, icon: menu.icon, sort: menu.sort ?? 1, parentId: menu.parentId }
  showModal.value = true
}

async function save() {
  if (editingId.value) {
    await api.menus.update(editingId.value, form.value)
    msg.success('更新成功')
  } else {
    await api.menus.create(form.value)
    msg.success('创建成功')
  }
  showModal.value = false
  await loadTree()
}

async function remove(id: number) {
  await api.menus.delete(id)
  msg.success('已删除')
  await loadTree()
}

function nodeProps({ option }: any) {
  return {
    style: 'cursor: pointer',
    onClick() { selectedMenu.value = option }
  }
}

onMounted(loadTree)
</script>

<template>
  <div class="page-container">
    <h2 class="text-xl font-bold mb-4">菜单管理 (OneToMany 自引用)</h2>
    <p class="text-gray-500 dark:text-gray-300 mb-4 text-sm">
      菜单树形结构，每个菜单可包含子菜单（OneToMany 自引用），与角色通过 ManyToMany 关联
    </p>
    <div class="card mb-4">
      <div class="flex-between mb-3">
        <span class="font-medium">菜单树</span>
        <NButton type="primary" size="small" @click="openCreate(null)">添加根菜单</NButton>
      </div>
      <NTree
        :data="treeData"
        :loading="loading"
        :node-props="nodeProps"
        key-field="id"
        label-field="name"
        children-field="children"
        default-expand-all
        block-line
      />
    </div>

    <NCard v-if="selectedMenu" title="菜单详情" class="card">
      <p><strong>ID:</strong> {{ selectedMenu.id }}</p>
      <p><strong>名称:</strong> {{ selectedMenu.name }}</p>
      <p><strong>路径:</strong> {{ selectedMenu.path }}</p>
      <p><strong>图标:</strong> {{ selectedMenu.icon }}</p>
      <p><strong>排序:</strong> {{ selectedMenu.sort }}</p>
      <div class="mt-3 flex gap-2">
        <NButton size="small" @click="openCreate(selectedMenu.id)">添加子菜单</NButton>
        <NButton size="small" @click="openEdit(selectedMenu)">编辑</NButton>
        <NButton size="small" type="error" @click="remove(selectedMenu.id)">删除</NButton>
      </div>
    </NCard>

    <NModal v-model:show="showModal" preset="card" title="菜单" style="width:500px">
      <NForm :model="form" label-placement="top">
        <NFormItem label="名称">
          <NInput v-model:value="form.name" />
        </NFormItem>
        <NFormItem label="路由路径">
          <NInput v-model:value="form.path" placeholder="/example" />
        </NFormItem>
        <NFormItem label="组件路径">
          <NInput v-model:value="form.component" placeholder="example/index" />
        </NFormItem>
        <NFormItem label="图标">
          <NInput v-model:value="form.icon" placeholder="settings" />
        </NFormItem>
        <NFormItem label="排序">
          <NInputNumber v-model:value="form.sort" :min="0" />
        </NFormItem>
        <NFormItem label="父菜单ID">
          <NInputNumber v-model:value="form.parentId" :min="0" :style="{ width: '100%' }" placeholder="留空为根节点" clearable />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" @click="save">保存</NButton>
        </div>
      </NForm>
    </NModal>
  </div>
</template>
