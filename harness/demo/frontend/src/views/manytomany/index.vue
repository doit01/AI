<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useMessage, NButton, NModal, NForm, NFormItem, NInput, NInputNumber, NDataTable, NSelect, NCheckbox, NCheckboxGroup, NSpace, NTabs, NTabPane, NCard, NTag } from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()

// ---- Students ----
const students = ref<any[]>([])
const showStudentModal = ref(false)
const studentEditingId = ref<number | null>(null)
const studentForm = ref({ name: '', age: 18 })

const studentColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '姓名', key: 'name' },
  { title: '年龄', key: 'age', width: 60 },
  { title: '操作', key: 'actions', width: 140, render(row: any) {
    return h(NSpace, () => [
      h(NButton, { size: 'small', onClick: () => openEditStudent(row) }, () => '编辑'),
      h(NButton, { size: 'small', type: 'error', onClick: () => deleteStudent(row.id) }, () => '删除')
    ])
  }}
]

// ---- Courses ----
const courses = ref<any[]>([])
const showCourseModal = ref(false)
const courseEditingId = ref<number | null>(null)
const courseForm = ref({ name: '' })

const courseColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '课程名', key: 'name' },
  { title: '操作', key: 'actions', width: 140, render(row: any) {
    return h(NSpace, () => [
      h(NButton, { size: 'small', onClick: () => openEditCourse(row) }, () => '编辑'),
      h(NButton, { size: 'small', type: 'error', onClick: () => deleteCourse(row.id) }, () => '删除')
    ])
  }}
]

// ---- Enrollment ----
const selectedStudentId = ref<number | null>(null)
const allCourses = ref<any[]>([])
const enrolledCourseIds = ref<number[]>([])
const selectedStudentName = ref('')

async function loadStudents() {
  students.value = await api.manytomany.students.list()
}
async function loadCourses() {
  courses.value = await api.manytomany.courses.list()
  allCourses.value = courses.value
}

function onStudentSelected(id: number) {
  selectedStudentId.value = id
  const s = students.value.find(st => st.id === id)
  selectedStudentName.value = s?.name || ''
  enrolledCourseIds.value = s?.courseIds ? [...s.courseIds] : []
}

async function saveEnrollment() {
  if (!selectedStudentId.value) return
  const s = students.value.find(st => st.id === selectedStudentId.value)
  await api.manytomany.students.update(selectedStudentId.value, { name: s?.name, age: s?.age, courseIds: enrolledCourseIds.value })
  msg.success('选课更新成功')
  await loadStudents()
  if (selectedStudentId.value) onStudentSelected(selectedStudentId.value)
}

// Student CRUD
function openCreateStudent() {
  studentEditingId.value = null
  studentForm.value = { name: '', age: 18 }
  showStudentModal.value = true
}
function openEditStudent(s: any) {
  studentEditingId.value = s.id
  studentForm.value = { name: s.name, age: s.age ?? 18 }
  showStudentModal.value = true
}
async function saveStudent() {
  const data = studentForm.value
  if (studentEditingId.value) {
    await api.manytomany.students.update(studentEditingId.value, data)
    msg.success('更新成功')
  } else {
    await api.manytomany.students.create(data)
    msg.success('创建成功')
  }
  showStudentModal.value = false
  await loadStudents()
}
async function deleteStudent(id: number) {
  await api.manytomany.students.delete(id)
  msg.success('已删除')
  await loadStudents()
}

// Course CRUD
function openCreateCourse() {
  courseEditingId.value = null
  courseForm.value = { name: '' }
  showCourseModal.value = true
}
function openEditCourse(c: any) {
  courseEditingId.value = c.id
  courseForm.value = { name: c.name }
  showCourseModal.value = true
}
async function saveCourse() {
  if (courseEditingId.value) {
    await api.manytomany.courses.update(courseEditingId.value, courseForm.value)
    msg.success('更新成功')
  } else {
    await api.manytomany.courses.create(courseForm.value)
    msg.success('创建成功')
  }
  showCourseModal.value = false
  await loadCourses()
}
async function deleteCourse(id: number) {
  await api.manytomany.courses.delete(id)
  msg.success('已删除')
  await loadCourses()
}

onMounted(() => { loadStudents(); loadCourses() })
</script>

<template>
  <div class="page-container">
    <h2 class="text-xl font-bold mb-4">学生 ↔ 课程 (ManyToMany)</h2>
    <NTabs type="line" animated>
      <NTabPane name="students" tab="维护学生">
        <div class="card">
          <div class="flex-between mb-3">
            <span class="font-medium">学生列表 ({{ students.length }})</span>
            <NButton size="small" type="primary" @click="openCreateStudent">+ 添加学生</NButton>
          </div>
          <NDataTable :columns="studentColumns" :data="students" size="small" :bordered="false" :single-line="false" />
        </div>
      </NTabPane>
      <NTabPane name="courses" tab="维护课程">
        <div class="card">
          <div class="flex-between mb-3">
            <span class="font-medium">课程列表 ({{ courses.length }})</span>
            <NButton size="small" type="primary" @click="openCreateCourse">+ 添加课程</NButton>
          </div>
          <NDataTable :columns="courseColumns" :data="courses" size="small" :bordered="false" :single-line="false" />
        </div>
      </NTabPane>
      <NTabPane name="enrollment" tab="维护选课">
        <NCard>
          <div class="mb-4">
            <span class="font-medium mr-3">选择学生：</span>
            <NSelect
              v-model:value="selectedStudentId"
              :options="students.map(s => ({ label: `${s.name} (${s.age}岁)`, value: s.id }))"
              placeholder="请选择学生"
              style="width:240px;display:inline-block"
              @update:value="onStudentSelected"
            />
          </div>
          <template v-if="selectedStudentId">
            <p class="mb-3"><strong>{{ selectedStudentName }}</strong> 的选课：</p>
            <NCheckboxGroup v-model:value="enrolledCourseIds">
              <div class="flex flex-wrap gap-3">
                <NCheckbox v-for="c in allCourses" :key="c.id" :value="c.id" :label="c.name" />
              </div>
            </NCheckboxGroup>
            <div class="mt-4">
              <NButton type="primary" @click="saveEnrollment">保存选课</NButton>
            </div>
            <div v-if="students.find(s => s.id === selectedStudentId)?.courseNames?.length" class="mt-4">
              <span class="font-medium">已选课程：</span>
              <NSpace>
                <NTag v-for="cn in students.find(s => s.id === selectedStudentId)?.courseNames" :key="cn" size="small" type="success">{{ cn }}</NTag>
              </NSpace>
            </div>
          </template>
        </NCard>
      </NTabPane>
    </NTabs>

    <!-- Student Modal -->
    <NModal v-model:show="showStudentModal" preset="card" :title="studentEditingId ? '编辑学生' : '添加学生'" style="width:420px">
      <NForm :model="studentForm" label-placement="top">
        <NFormItem label="姓名">
          <NInput v-model:value="studentForm.name" placeholder="请输入姓名" />
        </NFormItem>
        <NFormItem label="年龄">
          <NInputNumber v-model:value="studentForm.age" :min="1" :max="150" style="width:100%" />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showStudentModal = false">取消</NButton>
          <NButton type="primary" @click="saveStudent">保存</NButton>
        </div>
      </NForm>
    </NModal>

    <!-- Course Modal -->
    <NModal v-model:show="showCourseModal" preset="card" :title="courseEditingId ? '编辑课程' : '添加课程'" style="width:420px">
      <NForm :model="courseForm" label-placement="top">
        <NFormItem label="课程名">
          <NInput v-model:value="courseForm.name" placeholder="请输入课程名" />
        </NFormItem>
        <div class="flex justify-end gap-2 mt-4">
          <NButton @click="showCourseModal = false">取消</NButton>
          <NButton type="primary" @click="saveCourse">保存</NButton>
        </div>
      </NForm>
    </NModal>
  </div>
</template>
