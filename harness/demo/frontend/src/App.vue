<script setup lang="tsx">
import { ref, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NConfigProvider, darkTheme, NMessageProvider, NDialogProvider, NNotificationProvider, NLayout, NLayoutSider, NMenu, NIcon } from 'naive-ui'
import { HomeOutline, PeopleOutline, PersonOutline, SettingsOutline, ListOutline, GridOutline, DocumentOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const menuOptions = [
  { label: '部门人员管理', key: '/departments', icon: () => h(NIcon, null, h(HomeOutline)) },
  { label: '用户管理', key: '/users', icon: () => h(NIcon, null, h(PeopleOutline)) },
  { label: '角色管理', key: '/roles', icon: () => h(NIcon, null, h(PersonOutline)) },
  { label: '菜单管理', key: '/menus', icon: () => h(NIcon, null, h(SettingsOutline)) },
  { label: '学生选课 (ManyToMany)', key: '/manytomany', icon: () => h(NIcon, null, h(GridOutline)) },
  { label: '项目介绍', key: '/intro', icon: () => h(NIcon, null, h(DocumentOutline)) }
]

const activeKey = ref(route.path)

function handleUpdate(key: string) {
  activeKey.value = key
  router.push(key)
}
</script>

<template>
  <NConfigProvider :theme="darkTheme" class="dark">
    <NNotificationProvider>
      <NDialogProvider>
        <NMessageProvider>
          <NLayout has-sider style="height:100vh">
            <NLayoutSider bordered content-style="display:flex;flex-direction:column" :width="220" :native-scrollbar="false">
              <div class="p-4 text-center font-bold text-lg border-b border-gray-700">Demo 导航</div>
              <NMenu :value="activeKey" :options="menuOptions" @update:value="handleUpdate" />
            </NLayoutSider>
            <NLayout content-style="overflow:auto">
              <router-view />
            </NLayout>
          </NLayout>
        </NMessageProvider>
      </NDialogProvider>
    </NNotificationProvider>
  </NConfigProvider>
</template>

<style>
body {
  background: #1a1a2e;
  color: #e0e0e0;
  margin: 0;
}
</style>
