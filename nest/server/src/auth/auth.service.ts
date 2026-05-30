import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const password = crypto.createHash('sha256').update(dto.password).digest('hex')

    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, password, status: 1 },
      include: {
        roles: {
          include: { role: { include: { permissions: true } } },
        },
        department: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const payload = { sub: user.id, username: user.username }
    const accessToken = this.jwtService.sign(payload)

    const permissions = this.extractPermissions(user.roles)

    const { password: _, roles, ...userWithoutPassword } = user
    return {
      accessToken,
      user: { ...userWithoutPassword, roles, permissions },
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissions: true } } } },
        department: true,
      },
    })
    if (!user) throw new UnauthorizedException('用户不存在')
    const permissions = this.extractPermissions(user.roles)
    const { password, roles, ...userWithoutPassword } = user
    return { ...userWithoutPassword, roles, permissions }
  }

  private extractPermissions(
    roles: { role: { permissions: { permission: string }[] } }[],
  ): string[] {
    const set = new Set<string>()
    for (const ur of roles) {
      for (const rp of ur.role.permissions) {
        set.add(rp.permission)
      }
    }
    return [...set]
  }
}
