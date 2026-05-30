import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
dotenv.config({ path: require('path').resolve(__dirname, '../.env') })

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nest'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const ALL_PERMISSIONS = [
  'user:create', 'user:read', 'user:update', 'user:delete',
  'role:create', 'role:read', 'role:update', 'role:delete',
  'dept:create', 'dept:read', 'dept:update', 'dept:delete',
] as const

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  // ── 1. 部门 ──
  const rootDept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: '总公司', sort: 1, status: 1 },
  })

  const techDept = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: '技术部', parentId: 1, sort: 1, status: 1 },
  })

  const frontendGroup = await prisma.department.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: '前端组', parentId: 2, sort: 1, status: 1 },
  })

  const backendGroup = await prisma.department.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, name: '后端组', parentId: 2, sort: 2, status: 1 },
  })

  const marketDept = await prisma.department.upsert({
    where: { id: 5 },
    update: {},
    create: { id: 5, name: '市场部', parentId: 1, sort: 2, status: 1 },
  })

  const financeDept = await prisma.department.upsert({
    where: { id: 6 },
    update: {},
    create: { id: 6, name: '财务部', parentId: 1, sort: 3, status: 1 },
  })

  const hrDept = await prisma.department.upsert({
    where: { id: 7 },
    update: {},
    create: { id: 7, name: '人事部', parentId: 1, sort: 4, status: 1 },
  })

  console.log('✅ 部门创建完成')

  // ── 2. 角色 ──
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: { name: '超级管理员', code: 'admin', description: '系统超级管理员，拥有所有权限' },
  })

  const sysadminRole = await prisma.role.upsert({
    where: { code: 'sysadmin' },
    update: {},
    create: { name: '系统管理员', code: 'sysadmin', description: '系统管理员，管理所有模块' },
  })

  const hrManagerRole = await prisma.role.upsert({
    where: { code: 'hr-manager' },
    update: {},
    create: { name: '人事主管', code: 'hr-manager', description: '人事主管，可查看用户和部门' },
  })

  const normalRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: { name: '普通用户', code: 'user', description: '普通用户，仅有基础查看权限' },
  })

  console.log('✅ 角色创建完成')

  // ── 3. 角色-权限 ──
  // 超级管理员: 所有权限（用 * 通配）
  await prisma.rolePermission.upsert({
    where: { roleId_permission: { roleId: adminRole.id, permission: '*' } },
    update: {},
    create: { roleId: adminRole.id, permission: '*' },
  })

  // 系统管理员: 所有模块 CRUD
  for (const perm of ALL_PERMISSIONS) {
    await prisma.rolePermission.upsert({
      where: { roleId_permission: { roleId: sysadminRole.id, permission: perm } },
      update: {},
      create: { roleId: sysadminRole.id, permission: perm },
    })
  }

  // 人事主管: user:read, dept:read
  for (const perm of ['user:read', 'dept:read'] as const) {
    await prisma.rolePermission.upsert({
      where: { roleId_permission: { roleId: hrManagerRole.id, permission: perm } },
      update: {},
      create: { roleId: hrManagerRole.id, permission: perm },
    })
  }

  // 普通用户: user:read
  await prisma.rolePermission.upsert({
    where: { roleId_permission: { roleId: normalRole.id, permission: 'user:read' } },
    update: {},
    create: { roleId: normalRole.id, permission: 'user:read' },
  })

  console.log('✅ 角色-权限分配完成')

  // ── 4. 用户 ──
  // admin: 超级管理员
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashPassword('admin123'),
      realName: '系统管理员',
      email: 'admin@example.com',
      phone: '13800000001',
      status: 1,
    },
  })

  // sysadmin: 系统管理员，技术部
  await prisma.user.upsert({
    where: { username: 'sysadmin' },
    update: {},
    create: {
      username: 'sysadmin',
      password: hashPassword('admin123'),
      realName: '张三丰',
      email: 'sysadmin@example.com',
      phone: '13800000002',
      departmentId: techDept.id,
      status: 1,
    },
  })

  // zhangsan: 人事主管，人事部
  await prisma.user.upsert({
    where: { username: 'zhangsan' },
    update: {},
    create: {
      username: 'zhangsan',
      password: hashPassword('admin123'),
      realName: '张秋菊',
      email: 'zhangsan@example.com',
      phone: '13800000003',
      departmentId: hrDept.id,
      status: 1,
    },
  })

  // lisi: 普通用户，技术部-前端组
  await prisma.user.upsert({
    where: { username: 'lisi' },
    update: {},
    create: {
      username: 'lisi',
      password: hashPassword('admin123'),
      realName: '李小明',
      email: 'lisi@example.com',
      phone: '13800000004',
      departmentId: frontendGroup.id,
      status: 1,
    },
  })

  // wangwu: 普通用户，技术部-后端组
  await prisma.user.upsert({
    where: { username: 'wangwu' },
    update: {},
    create: {
      username: 'wangwu',
      password: hashPassword('admin123'),
      realName: '王大锤',
      email: 'wangwu@example.com',
      phone: '13800000005',
      departmentId: backendGroup.id,
      status: 1,
    },
  })

  // 停用用户示例
  await prisma.user.upsert({
    where: { username: 'zhaoqi' },
    update: {},
    create: {
      username: 'zhaoqi',
      password: hashPassword('admin123'),
      realName: '赵大勇（已离职）',
      email: 'zhaoqi@example.com',
      departmentId: marketDept.id,
      status: 0,
    },
  })

  console.log('✅ 用户创建完成')

  // ── 5. 用户-角色关联 ──
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (adminUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    })
  }

  const sysadminUser = await prisma.user.findUnique({ where: { username: 'sysadmin' } })
  if (sysadminUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: sysadminUser.id, roleId: sysadminRole.id } },
      update: {},
      create: { userId: sysadminUser.id, roleId: sysadminRole.id },
    })
  }

  const zhangsanUser = await prisma.user.findUnique({ where: { username: 'zhangsan' } })
  if (zhangsanUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: zhangsanUser.id, roleId: hrManagerRole.id } },
      update: {},
      create: { userId: zhangsanUser.id, roleId: hrManagerRole.id },
    })
  }

  const lisiUser = await prisma.user.findUnique({ where: { username: 'lisi' } })
  if (lisiUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: lisiUser.id, roleId: normalRole.id } },
      update: {},
      create: { userId: lisiUser.id, roleId: normalRole.id },
    })
  }

  const wangwuUser = await prisma.user.findUnique({ where: { username: 'wangwu' } })
  if (wangwuUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: wangwuUser.id, roleId: normalRole.id } },
      update: {},
      create: { userId: wangwuUser.id, roleId: normalRole.id },
    })
  }

  console.log('✅ 用户-角色关联完成')
  console.log('')
  console.log('🎉 测试数据初始化完成！')
  console.log('')
  console.log('测试账号:')
  console.log('  admin     / admin123 → 超级管理员 (所有权限)')
  console.log('  sysadmin  / admin123 → 系统管理员 (全部模块CRUD)')
  console.log('  zhangsan  / admin123 → 人事主管 (user:read, dept:read)')
  console.log('  lisi      / admin123 → 普通用户 (user:read)')
  console.log('  wangwu    / admin123 → 普通用户 (user:read)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
