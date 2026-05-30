import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getProfile } from '../api/auth'
import type { User } from '@nest/shared'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(!!localStorage.getItem('accessToken'))

  const permissions = computed(() => user.value?.permissions ?? [])

  function hasPermission(perm: string): boolean {
    return permissions.value.includes(perm)
  }

  function hasAnyPermission(perms: string[]): boolean {
    return perms.some((p) => permissions.value.includes(p))
  }

  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    user.value = res.data.user as User
    isLoggedIn.value = true
    return res.data
  }

  async function fetchProfile() {
    try {
      const res: any = await getProfile()
      user.value = res.data as User
    } catch {
      logout()
    }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, permissions, hasPermission, hasAnyPermission, login, fetchProfile, logout }
})
