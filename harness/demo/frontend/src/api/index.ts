const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  departments: {
    tree: () => request<any[]>('/departments/tree'),
    create: (data: any) => request<any>('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/departments/${id}`, { method: 'DELETE' })
  },
  users: {
    list: () => request<any[]>('/users'),
    get: (id: number) => request<any>(`/users/${id}`),
    byDepartment: (deptId: number) => request<any[]>(`/users/department/${deptId}`),
    create: (data: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' })
  },
  roles: {
    list: () => request<any[]>('/roles'),
    get: (id: number) => request<any>(`/roles/${id}`),
    create: (data: any) => request<any>('/roles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/roles/${id}`, { method: 'DELETE' })
  },
  menus: {
    tree: () => request<any[]>('/menus/tree'),
    list: () => request<any[]>('/menus'),
    create: (data: any) => request<any>('/menus', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/menus/${id}`, { method: 'DELETE' })
  },
  manytomany: {
    students: {
      list: () => request<any[]>('/manytomany/students'),
      create: (data: any) => request<any>('/manytomany/students', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: any) => request<any>(`/manytomany/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) => request<void>(`/manytomany/students/${id}`, { method: 'DELETE' })
    },
    courses: {
      list: () => request<any[]>('/manytomany/courses'),
      create: (data: any) => request<any>('/manytomany/courses', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: any) => request<any>(`/manytomany/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) => request<void>(`/manytomany/courses/${id}`, { method: 'DELETE' })
    }
  }
}
