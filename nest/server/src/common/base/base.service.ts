import { NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * 带分页的查询结果
 */
export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 通用查询参数
 */
export interface PaginationQuery {
  page?: number
  pageSize?: number
}

/**
 * 泛型 CRUD 基类 — 展示 TypeScript 泛型 + 继承 + 抽象方法
 *
 * T      = 实体类型 (如 UserEntity)
 * C      = CreateDTO
 * U      = UpdateDTO
 * Q      = QueryDTO (必须 extends PaginationQuery)
 *
 * 用法:
 *   class UserService extends BaseService<UserEntity, CreateUserDto, UpdateUserDto, UserQueryDto> {
 *     constructor(prisma: PrismaService) { super(prisma, 'user') }
 *     override async create(dto: CreateUserDto) { ...加强逻辑... }
 *   }
 */
export abstract class BaseService<
  T,
  C,
  U,
  Q extends PaginationQuery = PaginationQuery,
> {
  constructor(
    protected readonly prisma: PrismaService,
    /** Prisma 模型名，小写 — 用于 this.prisma[modelName] 动态委托 */
    protected readonly modelName: string,
    /** 
     * include 配置 — 子类通过 getter 覆盖
     * protected override get include() { return { department: true } }
     */
    protected readonly include?: Record<string, unknown>,
  ) {}

  // ─── 抽象方法：子类必须实现 ─────────────────────
  /** 将 DTO 转为 Prisma create data (可在子类中做密码哈希等预处理) */
  protected abstract toCreateData(dto: C): Record<string, unknown>
  /** 将 DTO 转为 Prisma update data */
  protected abstract toUpdateData(dto: U): Record<string, unknown>

  // ─── 钩子方法：子类可选覆盖 ─────────────────────
  /** beforeCreate — create 前的钩子 */
  protected async beforeCreate(_dto: C): Promise<void> {}
  /** afterCreate — create 后的钩子 */
  protected async afterCreate(_entity: T): Promise<void> {}

  // ─── 基础 CRUD ──────────────────────────────────

  /** 分页列表 */
  async findAll(query?: Q): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 20, ...filters } = (query ?? {}) as Record<string, any>
    const where = this.buildWhere(filters)

    const [items, total] = await Promise.all([
      (this.prisma as any)[this.modelName].findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: this.include,
        orderBy: { id: 'desc' } as any,
      }),
      (this.prisma as any)[this.modelName].count({ where }),
    ])
    return { list: items, total, page, pageSize }
  }

  /** 查单条，不存在抛 NotFoundException */
  async findOne(id: number): Promise<T> {
    const entity = await (this.prisma as any)[this.modelName].findUnique({
      where: { id },
      include: this.include,
    })
    if (!entity) throw new NotFoundException(`${this.modelName} 不存在`)
    return entity as T
  }

  /** 创建 */
  async create(dto: C): Promise<T> {
    await this.beforeCreate(dto)
    const data = this.toCreateData(dto)
    const entity = await (this.prisma as any)[this.modelName].create({
      data,
      include: this.include,
    })
    await this.afterCreate(entity as T)
    return entity as T
  }

  /** 更新 — 先检查存在性，再更新 */
  async update(id: number, dto: U): Promise<T> {
    await this.findOne(id) // 不存在则抛异常
    const data = this.toUpdateData(dto)
    const entity = await (this.prisma as any)[this.modelName].update({
      where: { id },
      data,
      include: this.include,
    })
    return entity as T
  }

  /** 删除 */
  async remove(id: number): Promise<{ id: number }> {
    await this.findOne(id)
    await (this.prisma as any)[this.modelName].delete({ where: { id } })
    return { id }
  }

  // ─── 内部方法 ──────────────────────────────────

  /** 
   * 将 query 参数转为 Prisma where
   * 子类可 override 实现自定义过滤逻辑
   */
  protected buildWhere(filters: Record<string, any>): Record<string, any> {
    const where: Record<string, any> = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && key !== 'page' && key !== 'pageSize') {
        where[key] = value
      }
    }
    return where
  }
}
