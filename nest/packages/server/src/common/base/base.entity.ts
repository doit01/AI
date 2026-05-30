/**
 * 抽象实体基类 — 展示 TypeScript 类继承模式
 *
 * 所有业务实体通过 extends BaseEntity 获得公共字段和方法。
 * 子类可 override toJSON() 实现定制序列化。
 */
export abstract class BaseEntity {
  /** 主键 — 每个实体必须有 */
  abstract id: number

  /** 状态：1=启用，0=禁用 */
  status: number = 1

  /** 时间戳 — 由 Prisma @default(now()) 赋值 */
  createdAt!: Date
  updatedAt!: Date

  /** 具体方法 — 所有子类继承 */
  isActive(): boolean {
    return this.status === 1
  }

  /** 
   * toJSON — 子类可 override 来排除敏感字段
   * 例如 UserEntity 覆写此方法以剥离 password
   */
  toJSON(): Record<string, unknown> {
    return { ...this } as Record<string, unknown>
  }
}
