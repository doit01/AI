import { BaseEntity } from '../common/base'

/**
 * 用户实体 — 继承 BaseEntity 展示 TypeScript 类继承
 *
 * 亮点:
 * 1. extends BaseEntity 获得 id/status/timestamps + isActive()
 * 2. override toJSON() 剥离敏感字段
 * 3. 可添加领域方法如 isAdmin()、canAccess()
 */
export class UserEntity extends BaseEntity {
  /** 主键 — 继承自 BaseEntity 的 abstract 实现 */
  declare id: number
  declare status: number
  declare createdAt: Date
  declare updatedAt: Date

  /** 用户特有字段 */
  username!: string
  password!: string
  realName?: string
  email?: string
  phone?: string
  avatar?: string
  departmentId?: number | null

  /** 关联数据（非 Prisma 原始字段，由 populate 赋值） */
  department?: { id: number; name: string } | null
  roles?: { role: { id: number; name: string; code: string } }[]

  // ─── 领域方法 ──────────────────────────────────

  /** 判断是否为超级管理员（示例） */
  isAdmin(): boolean {
    return this.roles?.some((ur) => ur.role.code === 'admin') ?? false
  }

  /** 
   * 覆写 toJSON — 排除 password
   * 这是继承 + 多态的典型用法：
   * 父类定义接口，子类定制行为
   */
  override toJSON(): Record<string, unknown> {
    const { password, ...rest } = this
    return rest
  }
}
