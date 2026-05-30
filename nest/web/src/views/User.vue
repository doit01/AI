<template>
  <div>
    <n-page-header subtitle="用户管理">
      <n-button v-if="authStore.hasPermission('user:create')" type="primary" @click="openAddDialog">新增用户</n-button>
    </n-page-header>

    <n-card style="margin-top: 16px">
      <n-space style="margin-bottom: 16px">
        <n-input v-model:value="query.keyword" placeholder="搜索用户名/姓名/邮箱" clearable style="width: 240px" />
        <n-select
          v-model:value="query.departmentId"
          :options="deptOptions"
          placeholder="选择部门"
          clearable
          style="width: 160px"
          label-field="label"
          value-field="id"
        />
        <n-select
          v-model:value="query.status"
          :options="statusOptions"
          placeholder="状态"
          clearable
          style="width: 100px"
        />
        <n-button @click="fetchUsers">查询</n-button>
      </n-space>

      <n-data-table
        :columns="columns"
        :data="userList"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </n-card>

    <n-modal
      v-model:show="showModal"
      :title="isEdit ? '编辑用户' : '新增用户'"
      preset="card"
      style="width: 560px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="100">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="form.username" placeholder="登录用户名" :disabled="isEdit" />
        </n-form-item>
        <n-form-item v-if="!isEdit" path="password" label="密码">
          <n-input v-model:value="form.password" type="password" placeholder="登录密码" />
        </n-form-item>
        <n-form-item path="realName" label="真实姓名">
          <n-input v-model:value="form.realName" placeholder="真实姓名" />
        </n-form-item>
        <n-form-item path="email" label="邮箱">
          <n-input v-model:value="form.email" placeholder="邮箱地址" />
        </n-form-item>
        <n-form-item path="phone" label="手机号">
          <n-input v-model:value="form.phone" placeholder="手机号码" />
        </n-form-item>
        <n-form-item path="departmentId" label="所属部门">
          <n-tree-select
            v-model:value="form.departmentId"
            :options="deptTree"
            placeholder="选择部门"
            clearable
            key-field="id"
            label-field="name"
            children-field="children"
          />
        </n-form-item>
        <n-form-item path="roleIds" label="分配角色">
          <n-select
            v-model:value="form.roleIds"
            :options="roleOptions"
            multiple
            placeholder="选择角色"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit" style="margin-left: 12px">保存</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useMessage, useDialog, NTag, NButton, NSpace } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { getUsers, createUser, updateUser, deleteUser, type User } from '../api/user'
import { getDepartments, type Department } from '../api/department'
import { getRoles, type Role } from '../api/role'

const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const loading = ref(false)
const userList = ref<User[]>([])
const total = ref(0)
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()
const deptTree = ref<Department[]>([])
const roleOptions = ref<{ label: string; value: number }[]>([])

const query = reactive({
  keyword: '',
  departmentId: undefined as number | undefined,
  status: undefined as number | undefined,
  page: 1,
  pageSize: 20,
})

const form = reactive({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  departmentId: null as number | null,
  roleIds: [] as number[],
})

const rules: any = {
  username: [{ required: true, message: '请输入用户名' }],
}

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 },
]

const deptOptions = computed(() => {
  function flatten(items: Department[]): { label: string; id: number }[] {
    const result: { label: string; id: number }[] = []
    for (const item of items) {
      result.push({ label: item.name, id: item.id })
      if (item.children) result.push(...flatten(item.children))
    }
    return result
  }
  return flatten(deptTree.value)
})

const columns = [
  { title: 'ID', key: 'id', width: 64 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '姓名', key: 'realName', width: 100 },
  { title: '邮箱', key: 'email', width: 180 },
  { title: '部门', key: 'department', width: 120, render: (row: User) => row.department?.name ?? '-' },
  {
    title: '角色',
    key: 'roles',
    width: 180,
    render: (row: User) =>
      row.roles?.map((r) => h(NTag, { size: 'small', style: 'margin: 2px' }, { default: () => r.role.name })) ?? '-',
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: User) =>
      h(NTag, { type: row.status === 1 ? 'success' : 'warning' }, { default: () => (row.status === 1 ? '正常' : '禁用') }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render: (row: User) =>
      h(NSpace, { justify: 'center' }, {
        default: () => [
          authStore.hasPermission('user:update') ? h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEditDialog(row) }, { default: () => '编辑' }) : null,
          authStore.hasPermission('user:delete') ? h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }) : null,
        ],
      }),
  },
]

const pagination = computed(() => ({
  page: query.page,
  pageSize: query.pageSize,
  itemCount: total.value,
  onChange: (page: number) => { query.page = page; fetchUsers() },
}))

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchDeptTree(), fetchRoles()])
})

async function fetchUsers() {
  loading.value = true
  try {
    const res: any = await getUsers(query)
    userList.value = res.data.list
    total.value = res.data.total
  } catch {
    message.error('加载用户失败')
  } finally {
    loading.value = false
  }
}

async function fetchDeptTree() {
  try {
    const res: any = await getDepartments()
    deptTree.value = res.data || []
  } catch { /* ignore */ }
}

async function fetchRoles() {
  try {
    const res: any = await getRoles()
    roleOptions.value = (res.data || []).map((r: Role) => ({ label: r.name, value: r.id }))
  } catch { /* ignore */ }
}

function handlePageChange(page: number) {
  query.page = page
  fetchUsers()
}

function openAddDialog() {
  isEdit.value = false
  editingId.value = null
  form.username = ''
  form.password = ''
  form.realName = ''
  form.email = ''
  form.phone = ''
  form.departmentId = null
  form.roleIds = []
  showModal.value = true
}

function openEditDialog(user: User) {
  isEdit.value = true
  editingId.value = user.id
  form.username = user.username
  form.password = ''
  form.realName = user.realName ?? ''
  form.email = user.email ?? ''
  form.phone = user.phone ?? ''
  form.departmentId = user.departmentId
  form.roleIds = user.roles?.map((r) => r.role.id) ?? []
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (isEdit.value && editingId.value) {
      await updateUser(editingId.value, {
        realName: form.realName,
        email: form.email,
        phone: form.phone,
        departmentId: form.departmentId,
        roleIds: form.roleIds.length > 0 ? form.roleIds : undefined,
      })
      message.success('更新成功')
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        realName: form.realName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        departmentId: form.departmentId,
        roleIds: form.roleIds.length > 0 ? form.roleIds : undefined,
      })
      message.success('创建成功')
    }
    showModal.value = false
    await fetchUsers()
  } catch (err: any) {
    message.error(err?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function handleDelete(user: User) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除用户 "${user.username}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteUser(user.id)
        message.success('删除成功')
        await fetchUsers()
      } catch (err: any) {
        message.error(err?.message || '删除失败')
      }
    },
  })
}
</script>
