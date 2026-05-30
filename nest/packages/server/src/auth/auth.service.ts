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
          include: { role: true },
        },
        department: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const payload = { sub: user.id, username: user.username }
    const accessToken = this.jwtService.sign(payload)

    const { password: _, ...userWithoutPassword } = user
    return {
      accessToken,
      user: userWithoutPassword,
    }
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissions: true } } } },
        department: true,
      },
    })
  }
}
