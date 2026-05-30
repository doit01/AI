import api from '.'

export interface User {
  id: number
  username: string
  realName: string | null
  email: string | null
  phone: string | null
  departmentId: number | null
  status: number
  department?: { id: number; name: string } | null
  roles?: { role: { id: number; name: string; code: string } }[]
  createdAt: string
}

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
