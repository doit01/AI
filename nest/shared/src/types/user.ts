export interface User {
  id: number
  username: string
  realName: string | null
  email: string | null
  phone: string | null
  avatar?: string
  departmentId: number | null
  status: number
  department?: { id: number; name: string } | null
  roles?: { role: { id: number; name: string; code: string } }[]
  createdAt: string
}

export interface CreateUserRequest {
  username: string
  password: string
  realName?: string
  email?: string
  phone?: string
  departmentId?: number
  roleIds?: number[]
}

export interface UpdateUserRequest {
  realName?: string
  email?: string
  phone?: string
  departmentId?: number
  status?: number
  roleIds?: number[]
}

export interface UserQuery {
  keyword?: string
  departmentId?: number
  status?: number
  page?: number
  pageSize?: number
}
