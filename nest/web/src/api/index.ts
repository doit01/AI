import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000', 10),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data ?? error)
  },
)

export type { ApiResponse } from '@nest/shared'

export default api
