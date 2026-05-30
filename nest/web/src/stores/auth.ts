import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getProfile } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const isLoggedIn = ref(!!localStorage.getItem('accessToken'))

  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    user.value = res.data.user
    isLoggedIn.value = true
    return res.data
  }

  async function fetchProfile() {
    try {
      const res: any = await getProfile()
      user.value = res.data
    } catch {
      logout()
    }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, login, fetchProfile, logout }
})
