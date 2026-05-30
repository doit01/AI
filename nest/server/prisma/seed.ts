import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
dotenv.config({ path: require('path').resolve(__dirname, '../.env') })

const connectionString = process.env.DATABASE_URL
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

  // ── 6. 知识库 ──
  const knowledgeData: { title: string; content: string; category: string; tags: string; sort: number }[] = [
    // ── 项目架构 ──
    { title: 'Monorepo 三包结构', content: '项目使用 pnpm workspace 管理三个独立包：server/ (NestJS 后端)、web/ (Vue 3 前端)、shared/ (共享类型与常量)。包间通过 workspace:* 协议引用，一次 pnpm install 安装所有依赖。', category: 'architecture', tags: 'monorepo,pnpm,workspace', sort: 1 },
    { title: 'server/ 后端分层', content: 'NestJS 采用模块化架构：Module 组织业务单元，Controller 处理 HTTP 路由，Service 封装业务逻辑，PrismaService 负责数据库访问。全局注册 Guard/Interceptor/Filter/Pipe 实现横切关注点。', category: 'architecture', tags: 'nestjs,module,layered-architecture', sort: 2 },
    { title: 'web/ 前端技术栈', content: 'Vue 3 + Vite + TypeScript + Pinia + Vue Router + Naive UI。Vite 提供秒级 HMR，Pinia 管理状态，Vue Router 处理路由守卫，Naive UI 提供开箱即用的企业级 UI 组件。', category: 'architecture', tags: 'vue,vite,pinia,router,naive-ui', sort: 3 },
    { title: 'shared/ 共享包设计', content: 'shared/ 包被 server 和 web 同时引用，存放前后端共用的 TypeScript 类型 (ApiResponse, PaginatedResult) 和权限常量 (ALL_PERMISSIONS)。避免前后端类型定义不同步。', category: 'architecture', tags: 'shared,types,constants', sort: 4 },

    // ── NestJS 核心 ──
    { title: '依赖注入 (DI)', content: 'NestJS 使用构造函数注入。所有 @Injectable() 装饰的类由 IoC 容器管理。PrismaService 在 PrismaModule 中标记 @Global() + exports，使其他模块无需 import 即可注入。', category: 'nestjs', tags: 'nestjs,di,ioc,injection', sort: 1 },
    { title: 'Controller + Route', content: '@Controller(\'departments\') 将路由挂载到 /api/departments (结合 main.ts 的 setGlobalPrefix(\'api\'))。方法装饰器 @Get()/@Post()/@Patch()/@Delete() 映射 HTTP 方法。', category: 'nestjs', tags: 'nestjs,controller,routing', sort: 2 },
    { title: 'Guard 守卫', content: 'JwtAuthGuard 继承 PassportStrategy 自动校验 JWT Token。PermissionGuard 读取 @RequirePermission() 元数据，从数据库查用户权限。两者通过 APP_GUARD 全局注册。', category: 'nestjs', tags: 'nestjs,guard,jwt,rbac,authorization', sort: 3 },
    { title: 'Interceptor 拦截器', content: 'TransformInterceptor 将成功响应统一包装为 { success, code, message, data }。LoggingInterceptor 记录请求方法和耗时。通过 APP_INTERCEPTOR 全局注册。', category: 'nestjs', tags: 'nestjs,interceptor,aop,logging', sort: 4 },
    { title: 'ExceptionFilter 异常过滤器', content: 'AllExceptionsFilter 捕获所有未处理异常，根据类型返回不同状态码和结构化错误信息。特殊处理 Prisma P2002 (唯一约束冲突) 和自定义 ApiException。', category: 'nestjs', tags: 'nestjs,exception-filter,error-handling', sort: 5 },
    { title: 'ValidationPipe 参数校验', content: '全局 ValidationPipe 配置 whitelist: true (自动剔除未定义字段)、transform: true (自动类型转换)、forbidNonWhitelisted: true (拒绝未定义字段)。配合 class-validator 装饰器在 DTO 中声明校验规则。', category: 'nestjs', tags: 'nestjs,validation,dto,pipe', sort: 6 },
    { title: '自定义装饰器', content: '@Public() — 跳过 JWT 校验 (通过 SetMetadata 和 Reflector 配合)。@RequirePermission(\'user:read\') — 给路由绑定所需权限。@CurrentUser() — 从 request.user 提取当前登录用户。', category: 'nestjs', tags: 'nestjs,decorator,metadata', sort: 7 },
    { title: 'ConfigModule 环境变量', content: '@nestjs/config 读取 .env 文件并全局注入。通过 ConfigService.get(\'JWT_SECRET\') 获取配置。支持 LOG_LEVEL、PORT、DATABASE_URL 等自定义变量。', category: 'nestjs', tags: 'nestjs,config,environment', sort: 8 },

    // ── Prisma ORM ──
    { title: 'Schema 驱动开发', content: 'prisma/schema.prisma 声明数据模型 (Model)，Prisma 自动生成类型安全 Client。修改 schema 后运行 prisma migrate dev 创建迁移，再运行 prisma generate 更新 Client 代码。', category: 'prisma', tags: 'prisma,schema,migration,orm', sort: 1 },
    { title: 'CRUD 操作全解', content: 'prisma.department.findMany({ where, orderBy, skip, take })、findUnique({ where: { id } })、create({ data })、update({ where, data })、delete({ where })。所有操作自动类型检查。', category: 'prisma', tags: 'prisma,crud,query', sort: 2 },
    { title: '关联查询 (include)', content: 'Prisma 的 include 支持嵌套查询：user → roles → role → permissions。深度关联可一次性加载完整数据树，避免 N+1 查询问题。', category: 'prisma', tags: 'prisma,include,relation,n-plus-one', sort: 3 },
    { title: 'Prisma 事务', content: '交互式事务 prisma.$transaction(async (tx) => { ... }) 保证多个数据库操作原子性。事务内必须使用 tx 参数 (不是外部的 this.prisma)。用于部门重名检查 + 创建的 TOCTOU 防护。', category: 'prisma', tags: 'prisma,transaction,toctou,atomic', sort: 4 },
    { title: '交互式事务实战 (TOCTOU 防护)', content: '部门创建时需避免竞态：多个请求同时创建同名部门。方案：在 $transaction 内先 findFirst 查重再 create，两步原子执行。\n\n代码示例：\nawait prisma.$transaction(async (tx) => {\n  const existing = await tx.department.findFirst({ where: { name } })\n  if (existing) throw new ConflictException(`名称"${name}"已存在`)\n  return tx.department.create({ data: { name } })\n})\n\n关键：使用 tx 参数而非外部 prisma，否则不在同一事务中，依然有 TOCTOU。更新时需排除自身：findFirst({ where: { name, id: { not } }})。', category: 'prisma', tags: 'prisma,transaction,toctou,conflict,code-example', sort: 5 },
    { title: 'Driver Adapter 新架构', content: '@prisma/adapter-pg 替代传统 Query Engine，无需二进制文件，部署更轻量。但 $on(\'query\') 事件不工作，query 日志需改用 log: [\'query\'] 配置走 stdout。', category: 'prisma', tags: 'prisma,driver-adapter,adapter-pg,logging', sort: 5 },
    { title: '表名映射 (@@map)', content: 'Prisma 默认使用模型名复数作为表名。@@map("users") 显式指定表名。@map("user_id") 可映射字段名。避免表名与数据库关键字冲突或风格不一致。', category: 'prisma', tags: 'prisma,map,naming', sort: 6 },
    { title: '开发迁移: migrate dev', content: 'prisma migrate dev 用于开发环境。它会检测 schema 变更 → 自动生成 migration.sql 文件 → 执行到本地数据库 → 并可选重置数据。每次 schema 改动后运行此命令，生成的迁移文件需提交到 Git。', category: 'prisma', tags: 'prisma,migration,dev,schema-change', sort: 7 },
    { title: '生产迁移: migrate deploy', content: 'prisma migrate deploy 用于生产环境。它只执行 migrations/ 目录中尚未应用的 .sql 文件，不会创建新迁移文件或重置数据。生产部署流程：本地改 schema → migrate dev 生成迁移 → 提交 Git → 部署时跑 migrate deploy + generate。', category: 'prisma', tags: 'prisma,migration,production,deploy', sort: 8 },
    { title: '生产加字段安全步骤', content: '生产环境加字段需分步进行避免锁表或丢数据：\n\n第一步：只加 nullable 字段或有默认值的字段 → prisma migrate deploy\n第二步：填充数据（执行 SQL UPDATE 补值）\n第三步：如需要再改 NOT NULL 约束 → 第二次 deploy\n\n禁止一步到位加 NOT NULL 无默认值字段，会导致已有行写入失败。', category: 'prisma', tags: 'prisma,migration,safe-deploy,schema-change', sort: 9 },

    // ── Vue 3 前端 ──
    { title: 'Composition API', content: '使用 <script setup lang="ts"> 语法。ref() 声明响应式数据，computed() 声明计算属性，onMounted() 处理生命周期。比 Options API 更灵活，类型推断更好。', category: 'frontend', tags: 'vue,composition-api,setup,ref', sort: 1 },
    { title: 'Pinia 状态管理', content: 'defineStore(\'auth\', () => { ... }) 定义 Store。user、isLoggedIn 为状态，login()、logout() 为 action，permissions 为 getter。支持在组件外使用 (如 router guard)。', category: 'frontend', tags: 'pinia,store,state-management', sort: 2 },
    { title: 'Vue Router 路由守卫', content: 'router.beforeEach() 全局前置守卫：未登录用户访问非公开路由 → 跳 /login；有权限要求但不满足 → 跳 /login。meta 字段传递公共标记和权限要求。', category: 'frontend', tags: 'vue-router,guard,navigation', sort: 3 },
    { title: 'Axios 封装技巧', content: '请求拦截器自动带 Bearer Token。响应拦截器自动 res.data 解包 (后端 TransformInterceptor 的外层)。401 状态自动清除 token 并跳登录页。', category: 'frontend', tags: 'axios,interceptor,http,token', sort: 4 },
    { title: 'Naive UI Provider 层级', content: 'App.vue 必须包裹 n-notification-provider → n-message-provider → n-dialog-provider。缺少任一 Provider 会导致 useMessage()/useDialog() 白屏无报错。', category: 'frontend', tags: 'naive-ui,provider,notification,dialog', sort: 5 },

    // ── 认证与权限 ──
    { title: 'JWT 认证流程', content: '登录 POST /api/auth/login → AuthService 校验用户名密码 (SHA256) → JwtService.sign({ sub: userId }) → 返回 accessToken → 前端存 localStorage → 后续请求自动带 Authorization: Bearer header。', category: 'auth', tags: 'jwt,auth,login,token', sort: 1 },
    { title: 'RBAC 权限模型', content: 'User → UserRole (多对多) → Role → RolePermission。用户拥有角色，角色拥有权限。PermissionGuard 从 DB 查询当前用户的所有角色权限，与 @RequirePermission() 对比。', category: 'auth', tags: 'rbac,role,permission,authorization', sort: 2 },
    { title: '通配符权限 (*)', content: '超级管理员角色只有一个权限 "*"，表示拥有全部权限。前后端判断时需 includes(\'*\') || includes(perm)。这是 RBAC 中常见的超级管理员模式。', category: 'auth', tags: 'rbac,wildcard,super-admin', sort: 3 },
    { title: '前端权限双重过滤', content: '侧边栏菜单用 permission 字段 + hasPermission() 过滤。路由用 meta.permission + beforeEach 守卫拦截。按钮级使用 v-if="hasPermission(\'dept:create\')" 控制可见性。', category: 'auth', tags: 'frontend,permission,menu,guard', sort: 4 },

    // ── 设计模式 ──
    { title: '模板方法模式 (BaseService)', content: 'BaseService 定义 CRUD 骨架和抽象方法 toCreateData()/toUpdateData()，子类实现具体的数据转换逻辑。钩子方法 beforeCreate()/afterCreate() 提供扩展点。', category: 'patterns', tags: 'template-method,inheritance,base-service', sort: 1 },
    { title: '管道过滤模式 (请求链)', content: 'NestJS 请求按管道顺序处理：Guard → Interceptor → Pipe → Controller。每个阶段可以拒绝请求或转换数据。类似 UNIX 管道或 Spring Boot Filter 链。', category: 'patterns', tags: 'pipeline,chain-of-responsibility,aop', sort: 2 },
    { title: 'DTO 模式 + 参数校验', content: 'CreateUserDto / UpdateUserDto 用 class-validator 装饰器声明规则 (IsString, IsOptional, MinLength, IsArray)。ValidationPipe 的 whitelist 自动剔除未声明字段，防止 Mass Assignment 攻击。', category: 'patterns', tags: 'dto,validation,security,mass-assignment', sort: 3 },
    { title: '树形递归 (buildTree)', content: 'DepartmentService.buildTree() 递归将扁平部门列表转为树形结构。从 parentId=null 的根节点开始，逐层匹配 children。树形结构适用于组织架构、分类目录、评论楼层等场景。', category: 'patterns', tags: 'tree,recursion,flatten-to-tree', sort: 4 },
    { title: '策略模式 (PassportStrategy)', content: '@nestjs/passport 的策略模式可灵活切换认证方式：JWT Strategy、OAuth2 Strategy、Local Strategy。每种策略实现 validate() 方法即可。', category: 'patterns', tags: 'strategy,passport,authentication', sort: 5 },

    // ── 日志系统 ──
    { title: 'Winston 日志配置', content: 'Winston 支持多 Transport：Console、File (combined.log + error.log)。格式 JSON 便于日志分析系统 (ELK) 消费。日志级别由 LOG_LEVEL 环境变量控制。', category: 'logging', tags: 'winston,logging,transport', sort: 1 },
    { title: '日志级别映射', content: 'LOG_LEVEL 控制 NestJS Logger 级别：error→只有 error；warn→error+warn；info→error+warn+log；debug→+debug；verbose→+verbose。生产环境推荐 info，开发环境推荐 debug。', category: 'logging', tags: 'logging,log-level,debug', sort: 2 },
    { title: 'Prisma 日志: stdout vs $on()', content: 'Prisma v7 Driver Adapter 模式下，$on(\'query\') 事件监听不可用。改用 PrismaClient({ log: [\'query\', \'info\', \'warn\', \'error\'] }) 走 stdout。生产环境关闭 query 日志以避免性能开销和 SQL 泄露。', category: 'logging', tags: 'prisma,logging,sql,driver-adapter', sort: 3 },

    // ── 常见陷阱 ──
    { title: '缺少 Naive UI Provider', content: '用了 useDialog() 但 App.vue 没包 <n-dialog-provider> → 白屏无任何报错。任何 useMessage()/useNotification()/useDialog() 都需要对应 Provider。', category: 'pitfalls', tags: 'naive-ui,provider,white-screen', sort: 1 },
    { title: 'Prisma 事务客户端混淆', content: 'prisma.$transaction(async (tx) => { ... }) 事务内必须使用 tx 参数操作数据库。使用外部 this.prisma 的操作将不会回滚。', category: 'pitfalls', tags: 'prisma,transaction,rollback', sort: 2 },
    { title: 'TransformInterceptor 空值', content: 'TransformInterceptor 的 data: data ?? null 确保后端返回 null 时 data 字段依旧存在。否则前端解构 res.data.data 会 undefined。', category: 'pitfalls', tags: 'interceptor,null,response', sort: 3 },
    { title: 'Prisma P2002 (not available)', content: 'Prisma v7 Driver Adapter 的 P2002 错误中 constraint 字段显示 (not available)。因为 driver-adapter 路径下 error.detail 不可用。手动查重 + 事务处理更可靠。', category: 'pitfalls', tags: 'prisma,error,p2002,duplicate', sort: 4 },
    { title: 'NestJS 全局 Pipe 需手动注册', content: 'APP_PIPE 的 useFactory 比 useClass 更灵活，可传参数 (whitelist, transform, forbidNonWhitelisted)。否则默认 ValidationPipe 只校验不转换。', category: 'pitfalls', tags: 'nestjs,pipe,validation,config', sort: 5 },
  ]

  await prisma.knowledge.deleteMany()
  for (const k of knowledgeData) {
    await prisma.knowledge.create({ data: k })
  }
  console.log('✅ 知识库创建完成 (' + knowledgeData.length + ' 条)')

  // ── 7. 计数器 (并发演示) ──
  await prisma.counter.upsert({
    where: { name: 'demo-counter' },
    update: { value: 0 },
    create: { name: 'demo-counter', value: 0 },
  })
  console.log('✅ 计数器创建完成')

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
