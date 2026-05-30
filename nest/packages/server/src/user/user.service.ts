import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { BaseService } from '../common/base'
import { UserEntity } from './user.entity'
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto'

/**
 * 用户服务 — 继承 BaseService 展示 TypeScript 泛型继承 + 多态
 *
 * 继承链: BaseService → UserService
 *   ┌────────────────────────────────────────────┐
 *   │ BaseService<T, C, U, Q>                    │
 *   │  ├─ findAll()  ← 继承 (分页查询)           │
 *   │  ├─ findOne()  ← 继承                      │
 *   │  ├─ create()   ← 覆写 (+密码哈希)          │
 *   │  ├─ update()   ← 继承                      │
 *   │  └─ remove()   ← 继承                      │
 *   └────────────────────────────────────────────┘
 *        ↑ extends
 *   ┌────────────────────────────────────────────┐
 *   │ UserService                                 │
 *   │  ├─ create() override → 先哈希密码再调super │
 *   │  └─ resetPassword() → 自己的新方法          │
 *   └────────────────────────────────────────────┘
 */
@Injectable()
export class UserService extends BaseService<
  UserEntity,
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user', {
      roles: { include: { role: true } },
      department: true,
    })
  }

  // ─── 实现抽象方法 ──────────────────────────────

  /** toCreateData — 把 DTO 转成 Prisma create data */
  protected toCreateData(dto: CreateUserDto): Record<string, unknown> {
    const { roleIds, ...fields } = dto
    return {
      ...fields,
      password: crypto.createHash('sha256').update(dto.password).digest('hex'),
      ...(roleIds?.length
        ? { roles: { create: roleIds.map((roleId) => ({ roleId })) } }
        : {}),
    }
  }

  protected toUpdateData(dto: UpdateUserDto): Record<string, unknown> {
    const { roleIds, ...fields } = dto
    return {
      ...fields,
      ...(roleIds !== undefined
        ? {
            roles: {
              deleteMany: {},
              create: roleIds.map((roleId) => ({ roleId })),
            },
          }
        : {}),
    }
  }

  // ─── 覆写 buildWhere — 支持 keyword 多字段搜索 ──

  protected override buildWhere(filters: Record<string, any>): Record<string, any> {
    const { keyword, ...rest } = filters
    const where: Record<string, any> = {}

    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { realName: { contains: keyword } },
        { email: { contains: keyword } },
      ]
    }
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null) {
        where[key] = value
      }
    }
    return where
  }

  // ─── 自己的新方法（不在 BaseService 中） ─────────

  /** 重置密码 */
  async resetPassword(id: number, newPassword: string) {
    const password = crypto.createHash('sha256').update(newPassword).digest('hex')
    return this.prisma.user.update({ where: { id }, data: { password } })
  }

  /** 按用户名查询（登录用，返回含 password） */
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } })
  }
}
