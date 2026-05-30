<template>
  <div>
    <n-page-header subtitle="组织架构管理">
      <n-button v-if="authStore.hasPermission('dept:create')" type="primary" @click="() => openAddDialog()">新增部门</n-button>
    </n-page-header>

    <n-card style="margin-top: 16px">
      <template #header>
        <n-space align="center">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索部门名称"
            clearable
            style="width: 240px"
          />
          <n-button quaternary @click="fetchTree">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </template>
          </n-button>
        </n-space>
      </template>

      <n-tree
        ref="treeRef"
        :data="filteredTreeData"
        block-line
        default-expand-all
        expand-on-click
        :render-label="renderLabel"
      />
    </n-card>

    <n-modal v-model:show="showModal" :title="isEdit ? '编辑部门' : '新增部门'" preset="card" style="width: 480px">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
        <n-form-item path="name" label="部门名称">
          <n-input v-model:value="form.name" placeholder="请输入部门名称" />
        </n-form-item>
        <n-form-item path="parentId" label="上级部门">
          <n-tree-select
            v-model:value="form.parentId"
            :options="treeData"
            placeholder="选择上级部门（留空为根节点）"
            clearable
            :disabled="isEdit"
            key-field="id"
            label-field="name"
            children-field="children"
          />
        </n-form-item>
        <n-form-item path="sort" label="排序">
          <n-input-number v-model:value="form.sort" :min="0" placeholder="排序号" />
        </n-form-item>
        <n-form-item v-if="isEdit" path="status" label="状态">
          <n-switch v-model:value="form.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit" style="margin-left: 12px">确定</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue'
import { useMessage, useDialog, NSpace, NButton, NTag } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, type Department } from '../api/department'

const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const treeRef = ref()
const treeData = ref<Department[]>([])
const searchKeyword = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  name: '',
  parentId: null as number | null,
  sort: 0,
  status: 1,
})

const rules = {
  name: [{ required: true, message: '请输入部门名称' }],
}

const filteredTreeData = computed(() => {
  if (!searchKeyword.value) return treeData.value
  return filterTree(treeData.value, searchKeyword.value.toLowerCase())
})

function filterTree(nodes: Department[], keyword: string): Department[] {
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children, keyword) : []
      const match = node.name.toLowerCase().includes(keyword)
      if (match || children.length > 0) {
        return { ...node, children }
      }
      return null
    })
    .filter(Boolean) as Department[]
}

onMounted(() => fetchTree())

async function fetchTree() {
  try {
    const res: any = await getDepartments()
    treeData.value = res.data || []
  } catch {
    message.error('加载部门失败')
  }
}

function openAddDialog(parentId?: number) {
  isEdit.value = false
  editingId.value = null
  form.name = ''
  form.parentId = parentId ?? null
  form.sort = 0
  form.status = 1
  showModal.value = true
}

function openEditDialog(node: any) {
  isEdit.value = true
  editingId.value = node.id
  form.name = node.name
  form.parentId = node.parentId
  form.sort = node.sort
  form.status = node.status ?? 1
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (isEdit.value && editingId.value) {
      await updateDepartment(editingId.value, { name: form.name, sort: form.sort, status: form.status })
      message.success('更新成功')
    } else {
      await createDepartment({ name: form.name, parentId: form.parentId ?? undefined, sort: form.sort })
      message.success('创建成功')
    }
    showModal.value = false
    await fetchTree()
  } catch (err: any) {
    message.error(err?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function handleDelete(node: any) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除部门 "${node.name}" 吗？${node.children?.length ? ' 该操作将同时删除所有子部门。' : ''}`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteDepartment(node.id)
        message.success('删除成功')
        await fetchTree()
      } catch (err: any) {
        message.error(err?.message || '删除失败')
      }
    },
  })
}

function renderLabel({ option }: { option: Department }) {
  const actions: any[] = []
  if (authStore.hasPermission('dept:update')) {
    actions.push(
      h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEditDialog(option) }, { default: () => '编辑' }),
    )
  }
  if (authStore.hasPermission('dept:delete')) {
    actions.push(
      h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(option) }, { default: () => '删除' }),
    )
  }
  if (authStore.hasPermission('dept:create')) {
    actions.push(
      h(NButton, { size: 'tiny', quaternary: true, onClick: () => openAddDialog(option.id) }, { default: () => '添加子级' }),
    )
  }

  return h('span', { class: 'tree-node' }, [
    h('span', { class: 'tree-node-name' }, [
      h('span', { class: 'folder-icon' },
        option.children?.length ? '📁' : '📄',
      ),
      h('span', { style: { fontWeight: option.children?.length ? '600' : '400' } }, option.name as string),
      option.status === 0
        ? h(NTag, { size: 'tiny', type: 'warning', style: 'margin-left: 8px' }, { default: () => '禁用' })
        : null,
    ]),
    h('span', { class: 'tree-node-actions' }, actions),
  ])
}
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 12px;
  min-height: 32px;
}
.tree-node-name {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}
.folder-icon {
  font-size: 15px;
  flex-shrink: 0;
}
.tree-node-actions {
  display: none;
  gap: 2px;
  flex-shrink: 0;
}
:deep(.n-tree-node-wrapper:hover) .tree-node-actions {
  display: flex;
}
</style>
