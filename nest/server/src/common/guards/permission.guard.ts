import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSION_KEY } from '../decorators/permission.decorator'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredPermissions || requiredPermissions.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id
    if (!userId) throw new ForbiddenException('无访问权限')

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: true } } },
    })

    const userPermissions = new Set<string>()
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        userPermissions.add(rp.permission)
      }
    }

    const hasAll = requiredPermissions.every((p) => userPermissions.has('*') || userPermissions.has(p))
    if (!hasAll) throw new ForbiddenException('权限不足')
    return true
  }
}
