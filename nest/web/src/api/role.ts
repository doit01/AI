import type { Role } from '@nest/shared'
import api from '.'

export type { Role }

export function getRoles() {
  return api.get<Role[]>('/roles')
}

export function getRole(id: number) {
  return api.get<Role>(`/roles/${id}`)
}

export function createRole(data: { name: string; code: string; description?: string; permissions?: string[] }) {
  return api.post('/roles', data)
}

export function updateRole(id: number, data: { name?: string; description?: string; permissions?: string[] }) {
  return api.patch(`/roles/${id}`, data)
}

export function deleteRole(id: number) {
  return api.delete(`/roles/${id}`)
}
