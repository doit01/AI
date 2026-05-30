/** 用户模块权限 */
export const USER_PERMISSIONS = [
  'user:create',
  'user:read',
  'user:update',
  'user:delete',
] as const

/** 角色模块权限 */
export const ROLE_PERMISSIONS = [
  'role:create',
  'role:read',
  'role:update',
  'role:delete',
] as const

/** 部门模块权限 */
export const DEPT_PERMISSIONS = [
  'dept:create',
  'dept:read',
  'dept:update',
  'dept:delete',
] as const

/** 所有权限列表 */
export const ALL_PERMISSIONS = [
  ...USER_PERMISSIONS,
  ...ROLE_PERMISSIONS,
  ...DEPT_PERMISSIONS,
] as const

/** 权限分组（按模块） */
export const PERMISSION_GROUPS = [
  { label: '用户管理', value: 'user', permissions: USER_PERMISSIONS },
  { label: '角色管理', value: 'role', permissions: ROLE_PERMISSIONS },
  { label: '部门管理', value: 'dept', permissions: DEPT_PERMISSIONS },
] as const

/** 权限字面量类型 */
export type Permission = (typeof ALL_PERMISSIONS)[number]
