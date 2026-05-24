<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import {
  useMessage, NButton, NModal, NForm, NFormItem, NInput, NSelect,
  NDataTable, NSpace, NTag
} from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()
const users = ref<any[]>([])
const departments = ref<any[]>([])
const roles = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  username: '', password: '', realName: '', email: '', phone: '',
  departmentId: null as number | null, roleIds: [] as number[]
})

function flattenTree(tree: any[], parentId: number | null = null): any[] {
  const result: any[] = []
  for (const node of tree) {
    result.push({ id: node.id, name: node.name, parentId: parentId ?? node.parentId })
    if (node.children) {
      result.push(...flattenTree(node.children, node.id))
    }
  }
  return result
}

const deptOptions = computed(() => {
  return flattenTree(departments.value).map(d => ({ label: d.name, value: d.id }))
})

const roleOptions = computed(() => {
  return roles.value.map(r => ({ label: r.name, value: r.id }))
})

async function load() {
  loading.value = true
  try {
    const [u, d, r] = await Promise.all([
      api.users.list(),
      api.departments.tree(),
      api.roles.list()
    ])
    users.value = u
    departments.value = d
    roles.value = r
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { username: '', password: '123456', realName: '', email: '', phone: '', departmentId: null, roleIds: [] }
  showModal.value = true
}

function openEdit(user: any) {
  editingId.value = user.id
  form.value = {
    username: user.username, password: '', realName: user.realName,
    email: user.email, phone: user.phone,
    departmentId: user.departmentId, roleIds: user.roleIds ?? []
  }
  showModal.value = true
}

async function save() {
  if (editingId.value) {
    await api.users.update(editingId.value, form.value)
    msg.success('更新成功')
  } else {
    await api.users.create(form.value)
    msg.success('创建成功')
  }
  showModal.value = false
  await load()
}

async function remove(id: number) {
  await api.users.delete(id)
  msg.success('已删除')
  await load()
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username' },
  { title: '姓名', key: 'realName' },
  { title: '邮箱', key: 'email' },
  { title: '手机', key: 'phone' },
  { title: '部门 (ManyToOne)', key: 'departmentName' },
  { title: '角色 (ManyToMany)', key: 'roleNames', render: (row: any) =>
      row.roleNames?.map((n: string) => h(NTag, { size: 'small' }, () => n)) },
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
    <h2 class="text-xl font-bold mb-4">用户管理 (ManyToOne + ManyToMany)</h2>
    <p class="text-gray-500 dark:text-gray-300 mb-4 text-sm">
      用户属于某个部门（ManyToOne Department），可以拥有多个角色（ManyToMany Role）
    </p>
    <div class="card">
      <div class="flex-between mb-3">
        <span class="font-medium">用户列表</span>
        <NButton type="primary" size="small" @click="openCreate">创建用户</NButton>
      </div>
      <NDataTable :columns="columns" :data="users" :loading="loading" :bordered="true" />
    </div>

    <NModal v-model:show="showModal" preset="card" title="用户" style="width:500px">
      <NForm :model="form" label-placement="top">
        <NFormItem label="用户名">
          <NInput v-model:value="form.username" :disabled="!!editingId" />
        </NFormItem>
        <NFormItem label="姓名">
          <NInput v-model:value="form.realName" />
        </NFormItem>
        <NFormItem label="邮箱">
          <NInput v-model:value="form.email" />
        </NFormItem>
        <NFormItem label="手机">
          <NInput v-model:value="form.phone" />
        </NFormItem>
        <NFormItem label="部门 (ManyToOne)">
          <NSelect v-model:value="form.departmentId" :options="deptOptions" clearable />
        </NFormItem>
        <NFormItem label="角色 (ManyToMany)">
          <NSelect v-model:value="form.roleIds" :options="roleOptions" multiple />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" @click="save">保存</NButton>
        </div>
      </NForm>
    </NModal>
  </div>
</template>
