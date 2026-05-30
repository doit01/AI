export interface Department {
  id: number
  name: string
  parentId: number | null
  sort: number
  status: number
  children?: Department[]
}

export interface CreateDepartmentRequest {
  name: string
  parentId?: number
  sort?: number
}

export interface UpdateDepartmentRequest {
  name?: string
  parentId?: number
  sort?: number
  status?: number
}
