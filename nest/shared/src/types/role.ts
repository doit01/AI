export interface Role {
  id: number
  name: string
  code: string
  description: string | null
  status: number
  permissions: { id: number; permission: string }[]
  _count?: { users: number }
}

export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  code?: string
  description?: string
  status?: number
  permissions?: string[]
}
