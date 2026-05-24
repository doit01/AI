<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useMessage, NButton, NModal, NForm, NFormItem, NInput, NInputNumber, NTree, NDataTable, NSelect, NTag, NSpace } from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()
const treeData = ref<any[]>([])
const loading = ref(false)
const selectedDept = ref<any>(null)
const users = ref<any[]>([])

// Department modal
const showDeptModal = ref(false)
const deptEditingId = ref<number | null>(null)
const deptForm = ref({ name: '', sort: 1, parentId: null as number | null })

// User modal
const showUserModal = ref(false)
const userEditingId = ref<number | null>(null)
const userForm = ref({ username: '', password: '123456', realName: '', email: '', phone: '', departmentId: null as number | null, roleIds: [] as number[] })
const roleOptions = ref<any[]>([])

const userColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username', width: 100 },
  { title: '姓名', key: 'realName', width: 100 },
  { title: '角色', key: 'roleNames', render(row: any) {
    if (!row.roleNames?.length) return ''
    return h(NSpace, () => row.roleNames.map((r: string) => h(NTag, { size: 'small' }, () => r)))
  }},
  { title: '操作', key: 'actions', width: 180, render(row: any) {
    return h(NSpace, () => [
      h(NButton, { size: 'small', onClick: () => openEditUser(row) }, () => '编辑'),
      h(NButton, { size: 'small', type: 'error', onClick: () => removeUser(row.id) }, () => '删除')
    ])
  }}
]

async function loadTree() {
  loading.value = true
  try {
    treeData.value = await api.departments.tree()
    // Re-select department if previously selected
    if (selectedDept.value) {
      const fresh = findDept(treeData.value, selectedDept.value.id)
      if (fresh) selectDept(fresh)
      else selectedDept.value = null
    }
  } finally {
    loading.value = false
  }
}

function findDept(nodes: any[], id: number): any {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findDept(n.children, id)
      if (found) return found
    }
  }
  return null
}

function selectDept(dept: any) {
  selectedDept.value = dept
  users.value = dept.users || []
}

function nodeProps({ option }: any) {
  return {
    style: 'cursor: pointer',
    onClick() { selectDept(option) }
  }
}

async function loadRoles() {
  const roles = await api.roles.list()
  roleOptions.value = roles.map((r: any) => ({ label: r.name, value: r.id }))
}

// Department CRUD
function openCreateDept(parentId: number | null) {
  deptEditingId.value = null
  deptForm.value = { name: '', sort: 1, parentId }
  showDeptModal.value = true
}

function openEditDept(dept: any) {
  deptEditingId.value = dept.id
  deptForm.value = { name: dept.name, sort: dept.sort ?? 1, parentId: dept.parentId }
  showDeptModal.value = true
}

async function saveDept() {
  if (deptEditingId.value) {
    await api.departments.update(deptEditingId.value, deptForm.value)
    msg.success('更新成功')
  } else {
    await api.departments.create(deptForm.value)
    msg.success('创建成功')
  }
  showDeptModal.value = false
  await loadTree()
}

async function removeDept(id: number) {
  await api.departments.delete(id)
  msg.success('已删除')
  if (selectedDept.value?.id === id) selectedDept.value = null
  await loadTree()
}

// User CRUD
function openCreateUser() {
  if (!selectedDept.value) return
  userEditingId.value = null
  userForm.value = { username: '', password: '123456', realName: '', email: '', phone: '', departmentId: selectedDept.value.id, roleIds: [] }
  showUserModal.value = true
}

function openEditUser(row: any) {
  userEditingId.value = row.id
  userForm.value = {
    username: row.username,
    password: '',
    realName: row.realName,
    email: row.email || '',
    phone: row.phone || '',
    departmentId: selectedDept.value?.id || row.departmentId,
    roleIds: row.roleIds || []
  }
  showUserModal.value = true
}

async function saveUser() {
  if (userEditingId.value) {
    await api.users.update(userEditingId.value, userForm.value)
    msg.success('更新成功')
  } else {
    await api.users.create(userForm.value)
    msg.success('添加成功')
  }
  showUserModal.value = false
  await loadTree()
}

async function removeUser(id: number) {
  await api.users.delete(id)
  msg.success('已删除')
  await loadTree()
}

onMounted(() => { loadTree(); loadRoles() })
</script>

<template>
  <div class="page-container">
    <h2 class="text-xl font-bold mb-4">部门人员管理</h2>
    <div class="flex gap-4" style="height: calc(100vh - 180px)">
      <!-- Left: Department Tree -->
      <div class="card" style="width: 320px; flex-shrink: 0; overflow: auto">
        <div class="flex-between mb-3">
          <span class="font-medium">部门树</span>
          <NButton size="tiny" type="primary" @click="openCreateDept(null)">+ 根部门</NButton>
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

      <!-- Right: Users table -->
      <div class="card flex-1" style="overflow: auto">
        <div v-if="!selectedDept" class="text-gray-400 dark:text-gray-300 flex items-center justify-center h-full">
          请从左侧选择一个部门
        </div>
        <template v-else>
          <div class="flex-between mb-3">
            <span class="font-medium">{{ selectedDept.name }} - 人员列表 ({{ users.length }})</span>
            <div class="flex gap-2">
              <NButton size="small" @click="openCreateDept(selectedDept.id)">子部门</NButton>
              <NButton size="small" @click="openEditDept(selectedDept)">编辑部门</NButton>
              <NButton size="small" type="primary" @click="openCreateUser()">+ 添加人员</NButton>
              <NButton size="small" type="error" @click="removeDept(selectedDept.id)">删除部门</NButton>
            </div>
          </div>
          <NDataTable
            :columns="userColumns"
            :data="users"
            :bordered="false"
            :single-line="false"
            size="small"
            :row-key="(row: any) => row.id"
          />
        </template>
      </div>
    </div>

    <!-- Department Modal -->
    <NModal v-model:show="showDeptModal" preset="card" title="部门" style="width:420px">
      <NForm :model="deptForm" label-placement="top">
        <NFormItem label="名称">
          <NInput v-model:value="deptForm.name" placeholder="请输入部门名称" />
        </NFormItem>
        <NFormItem label="排序">
          <NInputNumber v-model:value="deptForm.sort" :min="0" style="width:100%" />
        </NFormItem>
        <NFormItem label="父部门" v-if="deptForm.parentId !== null">
          <NInputNumber v-model:value="deptForm.parentId" :min="0" style="width:100%" disabled />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showDeptModal = false">取消</NButton>
          <NButton type="primary" @click="saveDept">保存</NButton>
        </div>
      </NForm>
    </NModal>

    <!-- User Modal -->
    <NModal v-model:show="showUserModal" preset="card" :title="userEditingId ? '编辑人员' : '添加人员'" style="width:450px">
      <NForm :model="userForm" label-placement="top">
        <NFormItem label="用户名">
          <NInput v-model:value="userForm.username" placeholder="登录账号" :disabled="!!userEditingId" />
        </NFormItem>
        <NFormItem label="姓名">
          <NInput v-model:value="userForm.realName" placeholder="真实姓名" />
        </NFormItem>
        <NFormItem label="密码">
          <NInput v-model:value="userForm.password" type="password" :placeholder="userEditingId ? '留空不修改' : '默认 123456'" />
        </NFormItem>
        <NFormItem label="角色">
          <NSelect v-model:value="userForm.roleIds" :options="roleOptions" multiple />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showUserModal = false">取消</NButton>
          <NButton type="primary" @click="saveUser">保存</NButton>
        </div>
      </NForm>
    </NModal>
  </div>
</template>
