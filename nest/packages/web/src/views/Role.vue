<template>
  <div>
    <n-page-header subtitle="角色管理">
      <n-button type="primary" @click="openAddDialog">新增角色</n-button>
    </n-page-header>

    <n-card style="margin-top: 16px">
      <n-data-table
        :columns="columns"
        :data="roleList"
        :loading="loading"
      />
    </n-card>

    <n-modal
      v-model:show="showModal"
      :title="isEdit ? '编辑角色' : '新增角色'"
      preset="card"
      style="width: 520px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="name" label="角色名称">
          <n-input v-model:value="form.name" placeholder="如：普通用户" />
        </n-form-item>
        <n-form-item path="code" label="角色编码">
          <n-input v-model:value="form.code" placeholder="如：user" :disabled="isEdit" />
        </n-form-item>
        <n-form-item path="description" label="描述">
          <n-input v-model:value="form.description" type="textarea" placeholder="角色描述" />
        </n-form-item>
        <n-form-item label="权限">
          <n-checkbox-group v-model:value="form.permissions">
            <n-space>
              <n-checkbox v-for="perm in allPermissions" :key="perm" :value="perm" :label="perm" />
            </n-space>
          </n-checkbox-group>
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
import { ref, reactive, onMounted, h } from 'vue'
import { useMessage, useDialog, NTag, NButton, NSpace, NPopconfirm } from 'naive-ui'
import { getRoles, createRole, updateRole, deleteRole, type Role } from '../api/role'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const roleList = ref<Role[]>([])
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
})

const rules = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [{ required: true, message: '请输入角色编码' }],
}

const allPermissions = [
  'user:create', 'user:read', 'user:update', 'user:delete',
  'role:create', 'role:read', 'role:update', 'role:delete',
  'dept:create', 'dept:read', 'dept:update', 'dept:delete',
]

const columns = [
  { title: 'ID', key: 'id', width: 64 },
  { title: '角色名称', key: 'name', width: 140 },
  { title: '角色编码', key: 'code', width: 120 },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '权限',
    key: 'permissions',
    width: 240,
    render: (row: Role) =>
      row.permissions?.slice(0, 3).map((p) =>
        h(NTag, { size: 'small', style: 'margin: 2px' }, { default: () => p.permission }),
      ) ?? '-',
  },
  {
    title: '用户数',
    key: '_count',
    width: 80,
    render: (row: Role) => row._count?.users ?? 0,
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: Role) =>
      h(NTag, { type: row.status === 1 ? 'success' : 'warning' }, { default: () => row.status === 1 ? '正常' : '禁用' }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render: (row: Role) =>
      h(NSpace, { justify: 'center' }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEditDialog(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
        ],
      }),
  },
]

onMounted(() => fetchRoles())

async function fetchRoles() {
  loading.value = true
  try {
    const res: any = await getRoles()
    roleList.value = res.data || []
  } catch {
    message.error('加载角色失败')
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEdit.value = false
  editingId.value = null
  form.name = ''
  form.code = ''
  form.description = ''
  form.permissions = []
  showModal.value = true
}

function openEditDialog(role: Role) {
  isEdit.value = true
  editingId.value = role.id
  form.name = role.name
  form.code = role.code
  form.description = role.description ?? ''
  form.permissions = role.permissions?.map((p) => p.permission) ?? []
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (isEdit.value && editingId.value) {
      await updateRole(editingId.value, {
        name: form.name,
        description: form.description || undefined,
        permissions: form.permissions,
      })
      message.success('更新成功')
    } else {
      await createRole({
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        permissions: form.permissions,
      })
      message.success('创建成功')
    }
    showModal.value = false
    await fetchRoles()
  } catch (err: any) {
    message.error(err?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function handleDelete(role: Role) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除角色 "${role.name}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteRole(role.id)
        message.success('删除成功')
        await fetchRoles()
      } catch (err: any) {
        message.error(err?.message || '删除失败')
      }
    },
  })
}
</script>
