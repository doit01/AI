<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import {
  useMessage, NButton, NModal, NForm, NFormItem, NInput,
  NDataTable, NSpace, NTreeSelect
} from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()
const roles = ref<any[]>([])
const menus = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', code: '', description: '', menuIds: [] as number[] })

const menuOptions = computed(() => {
  function mapTree(nodes: any[]): any[] {
    return nodes.map(n => ({
      label: n.name, value: n.id, key: n.id,
      children: n.children ? mapTree(n.children) : undefined
    }))
  }
  return mapTree(menus.value)
})

async function load() {
  loading.value = true
  try {
    const [r, m] = await Promise.all([api.roles.list(), api.menus.tree()])
    roles.value = r
    menus.value = m
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', code: '', description: '', menuIds: [] }
  showModal.value = true
}

function openEdit(role: any) {
  editingId.value = role.id
  form.value = { name: role.name, code: role.code, description: role.description, menuIds: role.menuIds ?? [] }
  showModal.value = true
}

async function save() {
  if (editingId.value) {
    await api.roles.update(editingId.value, form.value)
    msg.success('更新成功')
  } else {
    await api.roles.create(form.value)
    msg.success('创建成功')
  }
  showModal.value = false
  await load()
}

async function remove(id: number) {
  await api.roles.delete(id)
  msg.success('已删除')
  await load()
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '角色名', key: 'name' },
  { title: '编码', key: 'code' },
  { title: '描述', key: 'description' },
  { title: '操作', key: 'actions', width: 150, render: (row: any) => h(NSpace, {}, () => [
      h(NButton, { size: 'small', onClick: () => openEdit(row) }, () => '编辑'),
      h(NButton, { size: 'small', type: 'error', onClick: () => remove(row.id) }, () => '删除')
    ])
  }
]

onMounted(load)
</script>

<template>
  <div class="page-container">
    <h2 class="text-xl font-bold mb-4">角色管理 (ManyToMany 用户+菜单)</h2>
    <p class="text-gray-500 dark:text-gray-300 mb-4 text-sm">
      角色通过 ManyToMany 关联用户和菜单。一个角色可被多个用户拥有，也可拥有多个菜单权限
    </p>
    <div class="card">
      <div class="flex-between mb-3">
        <span class="font-medium">角色列表</span>
        <NButton type="primary" size="small" @click="openCreate">创建角色</NButton>
      </div>
      <NDataTable :columns="columns" :data="roles" :loading="loading" :bordered="true" />
    </div>

    <NModal v-model:show="showModal" preset="card" title="角色" style="width:500px">
      <NForm :model="form" label-placement="top">
        <NFormItem label="角色名">
          <NInput v-model:value="form.name" />
        </NFormItem>
        <NFormItem label="编码">
          <NInput v-model:value="form.code" />
        </NFormItem>
        <NFormItem label="描述">
          <NInput v-model:value="form.description" type="textarea" />
        </NFormItem>
        <NFormItem label="菜单权限 (ManyToMany)">
          <NTreeSelect v-model:value="form.menuIds" :options="menuOptions" multiple cascade />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" @click="save">保存</NButton>
        </div>
      </NForm>
    </NModal>
  </div>
</template>
