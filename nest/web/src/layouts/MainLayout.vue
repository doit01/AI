<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="logo">
        <n-h3 style="margin: 16px; text-align: center" v-show="!collapsed">PMS 权限管理</n-h3>
        <n-h3 style="margin: 16px; text-align: center" v-show="collapsed">PMS</n-h3>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered style="display: flex; align-items: center; justify-content: flex-end; padding: 0 24px; height: 48px">
        <n-dropdown trigger="hover" :options="userMenuOptions" @select="handleUserMenu">
          <n-button quaternary>
            <template #icon>
              <n-icon><n-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></n-icon></n-icon>
            </template>
            {{ authStore.user?.realName || authStore.user?.username }}
          </n-button>
        </n-dropdown>
      </n-layout-header>
      <n-layout-content style="padding: 24px">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

const activeKey = computed(() => route.name as string)

function renderIcon(icon: string) {
  return () => h(NIcon, null, { default: () => h('span', { innerHTML: icon }) })
}

interface MenuItem {
  label: string
  key: string
  icon: () => any
  permission: string
}

const allMenuItems: MenuItem[] = [
  { label: '部门管理', key: 'Departments', icon: renderIcon('📁'), permission: 'dept:read' },
  { label: '用户管理', key: 'Users', icon: renderIcon('👤'), permission: 'user:read' },
  { label: '角色管理', key: 'Roles', icon: renderIcon('🔑'), permission: 'role:read' },
]

const menuOptions = computed(() =>
  allMenuItems.filter((item) => authStore.hasPermission(item.permission)),
)

const userMenuOptions = [
  { label: '退出登录', key: 'logout' },
]

function handleMenuSelect(key: string) {
  router.push({ name: key })
}

function handleUserMenu(key: string) {
  if (key === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}
</script>
