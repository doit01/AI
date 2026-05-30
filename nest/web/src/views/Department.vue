<template>
  <div>
    <n-page-header subtitle="组织架构管理">
      <n-button v-if="authStore.hasPermission('dept:create')" type="primary" @click="openAddDialog">新增部门</n-button>
    </n-page-header>

    <n-card style="margin-top: 16px">
      <n-tree
        :data="treeData"
        :pattern="searchPattern"
        block-line
        cascade
        checkable
        default-expand-all
        :node-props="nodeProps"
      >
        <template #default="{ node }">
          <span class="tree-node">
            <span>{{ node.name }}</span>
            <n-tag v-if="node.status === 0" size="tiny" type="warning" style="margin-left: 8px">禁用</n-tag>
            <span class="tree-node-actions">
              <n-button v-if="authStore.hasPermission('dept:update')" size="tiny" quaternary @click.stop="openEditDialog(node)">编辑</n-button>
              <n-button v-if="authStore.hasPermission('dept:delete')" size="tiny" quaternary type="error" @click.stop="handleDelete(node)">删除</n-button>
              <n-button v-if="authStore.hasPermission('dept:create')" size="tiny" quaternary @click.stop="openAddDialog(node.id)">添加子级</n-button>
            </span>
          </span>
        </template>
      </n-tree>
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
      </n-form>
      <template #footer>
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit" style="margin-left: 12px">确定</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, type Department } from '../api/department'

const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const treeData = ref<Department[]>([])
const searchPattern = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  name: '',
  parentId: null as number | null,
  sort: 0,
})

const rules = {
  name: [{ required: true, message: '请输入部门名称' }],
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
  showModal.value = true
}

function openEditDialog(node: any) {
  isEdit.value = true
  editingId.value = node.id
  form.name = node.name
  form.parentId = node.parentId
  form.sort = node.sort
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (isEdit.value && editingId.value) {
      await updateDepartment(editingId.value, { name: form.name, sort: form.sort })
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
    content: `确定删除部门 "${node.name}" 吗？`,
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

function nodeProps({ option }: { option: Department }) {
  return {
    style: { width: '100%', display: 'flex' },
  }
}
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 16px;
}
.tree-node-actions {
  display: none;
  gap: 4px;
}
.n-tree-node-wrapper:hover .tree-node-actions {
  display: flex;
}
</style>
