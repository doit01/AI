import type { Department } from '@nest/shared'
import api from '.'

export type { Department }

export function getDepartments() {
  return api.get<Department[]>('/departments')
}

export function createDepartment(data: { name: string; parentId?: number; sort?: number }) {
  return api.post('/departments', data)
}

export function updateDepartment(id: number, data: Partial<Department>) {
  return api.patch(`/departments/${id}`, data)
}

export function deleteDepartment(id: number) {
  return api.delete(`/departments/${id}`)
}
