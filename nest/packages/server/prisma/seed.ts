import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: { name: '超级管理员', code: 'admin', description: '系统超级管理员' },
  })

  await prisma.rolePermission.createMany({
    data: ['*'].map((p) => ({ roleId: adminRole.id, permission: p })),
    skipDuplicates: true,
  })

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashPassword('admin123'),
      realName: '系统管理员',
      status: 1,
    },
  })

  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (adminUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    })
  }

  const rootDept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: '总公司', sort: 1, status: 1 },
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
