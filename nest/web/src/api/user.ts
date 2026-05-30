import type { User } from '@nest/shared'
import api from '.'

export type { User }

export function getUsers(params: {
  keyword?: string
  departmentId?: number
  status?: number
  page?: number
  pageSize?: number
}) {
  return api.get<{ list: User[]; total: number; page: number; pageSize: number }>('/users', { params })
}

export function getUser(id: number) {
  return api.get<User>(`/users/${id}`)
}

export function createUser(data: any) {
  return api.post('/users', data)
}

export function updateUser(id: number, data: any) {
  return api.patch(`/users/${id}`, data)
}

export function deleteUser(id: number) {
  return api.delete(`/users/${id}`)
}
