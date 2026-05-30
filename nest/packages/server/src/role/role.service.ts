import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BaseService } from '../common/base'
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto'

/**
 * 角色服务 — 继承 BaseService 展示复杂 CRUD 的覆写
 *
 * 演示点:
 * - toCreateData 中处理关联表（role_permissions）
 * - override create/update: 先调父类太简单，这里全覆写
 * - 展示了"继承 + 覆写"的两种风格
 */
@Injectable()
export class RoleService extends BaseService<
  any,
  CreateRoleDto,
  UpdateRoleDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'role', { permissions: true })
  }

  protected toCreateData(dto: CreateRoleDto): Record<string, unknown> {
    const { permissions, ...fields } = dto
    return {
      ...fields,
      ...(permissions?.length
        ? { permissions: { create: permissions.map((p) => ({ permission: p })) } }
        : {}),
    }
  }

  protected toUpdateData(dto: UpdateRoleDto): Record<string, unknown> {
    const { permissions, ...fields } = dto
    return {
      ...fields,
      ...(permissions !== undefined
        ? {
            permissions: {
              deleteMany: {},
              create: permissions.map((p) => ({ permission: p })),
            },
          }
        : {}),
    }
  }

  /** 覆写 findAll — 额外返回用户计数 */
  override async findAll(): Promise<any> {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { id: 'asc' },
    })
  }
}
