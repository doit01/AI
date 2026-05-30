import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BaseService } from '../common/base'
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto'

/**
 * 部门服务 — 继承 BaseService 展示通用 CRUD 复用
 *
 * 演示点:
 * - 继承 BaseService 获得 findAll/findOne/create/update/remove
 * - override toCreateData / toUpdateData 实现 DTO 映射
 * - override findOne + remove 增加业务逻辑（禁止删除有子部门的父部门）
 */
@Injectable()
export class DepartmentService extends BaseService<
  any,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'department')
  }

  protected toCreateData(dto: CreateDepartmentDto): Record<string, unknown> {
    return { ...dto }
  }

  protected toUpdateData(dto: UpdateDepartmentDto): Record<string, unknown> {
    return { ...dto }
  }

  /** 覆写 — 事务内检查+创建，避免 TOCTOU 竞态 */
  override async create(dto: CreateDepartmentDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.department.findFirst({ where: { name: dto.name } })
      if (existing) throw new ConflictException(`部门名称 "${dto.name}" 已存在`)

      const data = this.toCreateData(dto) as any
      return tx.department.create({ data })
    })
  }

  /** 覆写 — 事务内检查+更新 */
  override async update(id: number, dto: UpdateDepartmentDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const dept = await tx.department.findUnique({ where: { id } })
      if (!dept) throw new NotFoundException(`department 不存在`)

      if (dto.name && dto.name !== dept.name) {
        const dup = await tx.department.findFirst({
          where: { name: dto.name, id: { not: id } },
        })
        if (dup) throw new ConflictException(`部门名称 "${dto.name}" 已存在`)
      }

      const data = this.toUpdateData(dto) as any
      return tx.department.update({ where: { id }, data })
    })
  }

  /** 覆写 — 返回树形结构 */
  override async findAll(): Promise<any> {
    const depts = await this.prisma.department.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    })
    return this.buildTree(depts)
  }

  /** 覆写 findOne — 保持原有方法签名 */
  override async findOne(id: number) {
    return super.findOne(id)
  }

  /** 覆写 — 事务内检查子部门+删除，避免竞态 */
  override async remove(id: number): Promise<{ id: number }> {
    return this.prisma.$transaction(async (tx) => {
      const dept = await tx.department.findUnique({ where: { id } })
      if (!dept) throw new NotFoundException(`department 不存在`)

      const children = await tx.department.findMany({ where: { parentId: id } })
      if (children.length > 0) {
        throw new Error('该部门下有子部门，无法删除')
      }

      await tx.department.delete({ where: { id } })
      return { id }
    })
  }

  /** 私有方法 — 构建树 */
  private buildTree(
    items: { id: number; name: string; parentId: number | null; sort: number; status: number }[],
    parentId: number | null = null,
  ): any[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }))
  }
}
