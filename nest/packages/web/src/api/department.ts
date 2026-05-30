import api from '.'

export interface Department {
  id: number
  name: string
  parentId: number | null
  sort: number
  status: number
  children?: Department[]
}

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
