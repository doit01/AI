# PMS 技术栈全景手册

> 本项目（PMS 权限管理系统）是一套完整的全栈教学示例，覆盖了 NestJS + Prisma + Vue 3 + Naive UI 的核心技术。本文档面向新人，逐层拆解技术点、工具用法和最佳实践。

---

## 目录

1. [项目结构总览](#1-项目结构总览)
2. [Prisma ORM](#2-prisma-orm)
3. [NestJS 后端框架](#3-nestjs-后端框架)
4. [Vue 3 前端框架](#4-vue-3-前端框架)
5. [Naive UI 组件库](#5-naive-ui-组件库)
6. [认证与授权 (RBAC)](#6-认证与授权-rbac)
7. [日志系统](#7-日志系统)
8. [API 设计模式](#8-api-设计模式)
9. [共享包 (@nest/shared)](#9-共享包-nestshared)
10. [知识库模块 (Knowledge Module)](#10-知识库模块-knowledge-module)
11. [并发控制演示 (Concurrency Module)](#11-并发控制演示-concurrency-module)
12. [pnpm Monorepo](#12-pnpm-monorepo)
13. [实战经验总结](#13-实战经验总结)

---

## 1. 项目结构总览

```
nest/
├── server/             # NestJS 后端
│   ├── src/
│   │   ├── auth/           # 认证模块 (JWT 登录)
│   │   ├── user/           # 用户模块 (CRUD)
│   │   ├── role/           # 角色模块 (CRUD + 权限分配)
│   │   ├── department/     # 部门模块 (树形结构)
│   │   ├── prisma/         # Prisma 数据库服务
│   │   ├── common/         # 公共抽象层
│   │   │   ├── base/       # BaseService 泛型 CRUD 基类
│   │   │   ├── decorators/ # 自定义装饰器 (@Public, @RequirePermission, @CurrentUser)
│   │   │   ├── guards/     # 守卫 (JwtAuthGuard, PermissionGuard)
│   │   │   ├── interceptors/ # 拦截器 (TransformInterceptor, LoggingInterceptor)
│   │   │   ├── filters/    # 异常过滤器 (AllExceptionsFilter)
│   │   │   └── pipes/      # 管道 (ValidationPipe)
│   │   ├── logger/         # Winston 日志服务
│   │   ├── app.module.ts   # 根模块 (全局注册)
│   │   └── main.ts         # 启动入口
│   └── prisma/
│       ├── schema.prisma   # 数据库模型定义
│       └── seed.ts         # 种子数据
├── web/                # Vue 3 前端
│   └── src/
│       ├── api/            # Axios HTTP 封装
│       ├── router/         # Vue Router 路由配置
│       ├── stores/         # Pinia 状态管理
│       ├── views/          # 页面组件
│       ├── layouts/        # 布局组件
│       ├── App.vue         # 根组件
│       └── main.ts         # 入口
├── shared/             # 共享包 (类型 + 常量)
│   └── src/
│       ├── types/         # TypeScript 接口定义
│       └── constants/     # 权限常量
└── docs/               # 本文档
```

**关键设计**: pnpm workspace monorepo — `server`、`web`、`shared` 三个独立包通过 `workspace:*` 协议相互引用。

---

## 2. Prisma ORM

### 2.1 什么是 Prisma？

Prisma 是 Node.js/TypeScript 生态中最流行的 ORM（对象关系映射）之一。它通过声明式 schema 自动生成类型安全的客户端代码，让你用 TypeScript 函数调用替代手写 SQL。

### 2.2 Schema 定义 (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Department {
  id        Int          @id @default(autoincrement())
  name      String       @db.VarChar(100)
  parentId  Int?
  sort      Int          @default(0)
  status    Int          @default(1)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  parent    Department?  @relation("DepartmentTree", fields: [parentId], references: [id])
  children  Department[] @relation("DepartmentTree")
  users     User[]
  @@map("departments")
}
```

| 知识点 | 说明 |
|--------|------|
| `@id @default(autoincrement())` | 自增主键 |
| `@db.VarChar(100)` | 指定 PostgreSQL 的 VARCHAR 长度 |
| `Int?` | 可选字段（TypeScript `number \| null`） |
| `@default(1)` | 默认值 |
| `@updatedAt` | 自动管理更新时间的字段 |
| `@relation("DepartmentTree")` | 自引用关系（树形结构） |
| `Department[]` | 一对多关系 |
| `@@map("departments")` | 表名映射（Prisma 默认用模型名复数） |

### 2.3 核心 Prisma Client API

```typescript
// 查全部
prisma.department.findMany({ where: { status: 1 }, orderBy: { sort: 'asc' } })

// 查单条（找不到返回 null）
prisma.user.findUnique({ where: { id: 1 }, include: { roles: true } })

// 创建
prisma.department.create({ data: { name: '技术部', parentId: null } })

// 更新（先检查存在性）
prisma.department.update({ where: { id: 1 }, data: { name: '新名称' } })

// 删除
prisma.department.delete({ where: { id: 1 } })

// 计数
prisma.user.count({ where: { status: 1 } })

// 分页（skip + take）
prisma.user.findMany({ skip: 0, take: 20 })
```

### 2.4 关联查询 (include)

```typescript
// 嵌套 include: 用户 → 角色 → 角色权限
await prisma.user.findFirst({
  where: { username, password },
  include: {
    roles: {
      include: { role: { include: { permissions: true } } },
    },
    department: true,
  },
})
```

### 2.5 事务

Prisma 提供两种事务方式：

```typescript
// 方式 1: 交互式事务（推荐用于复杂逻辑）
await prisma.$transaction(async (tx) => {
  const existing = await tx.department.findFirst({ where: { name: dto.name } })
  if (existing) throw new ConflictException('名称已存在')
  return tx.department.create({ data })
})

// 方式 2: 批量事务（用于多个独立操作）
await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { status: 0 } }),
  prisma.userLog.create({ data: { userId: 1, action: 'disable' } }),
])
```

> **注意**: 事务内的 Prisma Client 必须是 `tx` 参数（不是外部的 `this.prisma`），否则不在同一事务中。

### 2.6 交互式事务实战 — TOCTOU 防护

**问题场景**: 创建部门时先查重再创建，两个请求同时发起，查重都通过然后都创建成功。

**TOCTOU (Time-of-Check to Time-of-Use)**: 检查状态到使用状态之间，状态被其他并发操作改变。

**错误做法**：
```typescript
// ❌ 两步分开：先查再写，存在竞态窗口
const existing = await this.prisma.department.findFirst({ where: { name } })
if (existing) throw new ConflictException('名称已存在')
return this.prisma.department.create({ data: { name } })
// 两个请求同时到 → 查重都通过 → 创建两条同名记录
```

**正确做法 — 事务内原子执行**：
```typescript
// ✅ 查重 + 创建在同一个事务中，原子执行
return this.prisma.$transaction(async (tx) => {
  const existing = await tx.department.findFirst({ where: { name } })
  if (existing) throw new ConflictException(`名称 "${name}" 已存在`)
  return tx.department.create({ data: { name } })
})
```

**更新时排除自身**：
```typescript
// 修改名称时需要查重，但排除自己
return this.prisma.$transaction(async (tx) => {
  const existing = await tx.department.findFirst({
    where: { name: dto.name, id: { not: id } },
  })
  if (existing) throw new ConflictException(`名称 "${dto.name}" 已存在`)
  return tx.department.update({ where: { id }, data: { name: dto.name } })
})
```

> **要点**: 事务内必须用 `tx` 参数而非外部 `this.prisma`，否则操作不在同一事务中，TOCTOU 依然存在。

### 2.6 日志配置

```typescript
const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error']

new PrismaClient({ log: logLevels })
```

| 级别 | 说明 |
|------|------|
| `query` | 打印 SQL 语句 + 参数 + 耗时 |
| `info` | 信息性消息 |
| `warn` | 警告（如慢查询） |
| `error` | 错误 |

> **已知限制**: 使用 `@prisma/adapter-pg`（Driver Adapter）时，`$on('query')` 事件监听不可用，必须用 `log: ['query']` 走 stdout。

### 2.7 Driver Adapter (`@prisma/adapter-pg`)

本项目使用 Prisma v7 + `@prisma/adapter-pg`，这是 Prisma 的新架构——通过原生 PostgreSQL 驱动直接发 SQL，取代之前的查询引擎二进制文件。

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg(new Pool({ connectionString }))
const prisma = new PrismaClient({ adapter })
```

优势：
- 无需下载 Prisma 查询引擎二进制（部署更轻量）
- 原生绑定性能更好
- 但部分 API 有差异（如 `$on('query')` 不工作）

### 2.8 常用命令

```bash
pnpm prisma:generate    # 生成 Prisma Client 类型（每次改 schema 后都需运行）
pnpm prisma:migrate     # 创建并应用数据库迁移
pnpm prisma:seed        # 填充测试数据
```

---

## 3. NestJS 后端框架

### 3.1 核心概念

| 概念 | 说明 | 类比（Spring Boot） |
|------|------|---------------------|
| **Module** | 模块，应用的组织单元 | `@Module` |
| **Controller** | 处理 HTTP 请求 | `@Controller` |
| **Provider** | 可注入的服务 | `@Injectable` |
| **Guard** | 请求守卫（权限检查） | Filter/Interceptor |
| **Interceptor** | 请求拦截器（包装响应/日志） | `HandlerInterceptor` |
| **Pipe** | 管道（参数校验/转换） | `@Validated` |
| **Filter** | 异常过滤器（统一错误处理） | `@ExceptionHandler` |
| **Decorator** | 自定义装饰器 | 自定义注解 |
| **ModuleRef** | IoC 容器引用 | `ApplicationContext` |

### 3.2 依赖注入 (DI)

NestJS 使用构造函数注入，所有 `@Injectable()` 类自动成为可注入的 Provider：

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,    // 自动注入
    private jwtService: JwtService,
  ) {}
}
```

### 3.3 模块化架构

```typescript
// 每个业务一个 module，内聚 controller + service + dto
@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],  // 导出给其他模块用
})
export class DepartmentModule {}
```

**全局模块**: 用 `@Global()` 装饰器标记，导出的 Provider 全局可用（如 `PrismaModule`）。

### 3.4 全局注册模式

在 `app.module.ts` 中通过 `APP_*` token 全局注册：

```typescript
providers: [
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_PIPE, useFactory: () => new ValidationPipe({ whitelist: true }) },
]
```

### 3.5 自定义装饰器

```typescript
// 1. @Public() — 标记公开路由（跳过 JWT 校验）
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

// 2. @RequirePermission('user:read') — 标记需要的权限
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions)

// 3. @CurrentUser() — 从 request 提取当前用户
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)
```

### 3.6 ConfigModule (环境变量)

```typescript
// app.module.ts
ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })

// 使用
constructor(private configService: ConfigService) {}
const secret = configService.get<string>('JWT_SECRET')
```

### 3.7 Passport + JWT 认证

```typescript
// JWT Strategy — 验证 token 并提取用户
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: { sub: number }) {
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new UnauthorizedException()
    return user  // → request.user
  }
}
```

---

## 4. Vue 3 前端框架

### 4.1 核心栈

| 技术 | 用途 |
|------|------|
| **Vue 3** (Composition API) | 前端框架 |
| **Vite** | 构建工具（秒级热更新） |
| **TypeScript** | 类型安全 |
| **Pinia** | 状态管理 |
| **Vue Router** | 路由 |
| **Axios** | HTTP 客户端 |
| **Naive UI** | UI 组件库 |

### 4.2 Composition API (setup 语法)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const count = ref(0)           // 响应式数据
const doubled = computed(() => count.value * 2)  // 计算属性

onMounted(() => {              // 生命周期
  console.log('mounted')
})

function increment() {         // 方法
  count.value++
}
</script>
```

### 4.3 Pinia 状态管理

```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(!!localStorage.getItem('accessToken'))

  const permissions = computed(() => user.value?.permissions ?? [])

  function hasPermission(perm: string): boolean {
    return permissions.value.includes('*') || permissions.value.includes(perm)
  }

  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    user.value = res.data.user as User
    isLoggedIn.value = true
  }

  return { user, isLoggedIn, permissions, hasPermission, login }
})
```

### 4.4 Vue Router + 路由守卫

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        { path: 'departments', component: () => import('../views/Department.vue'), meta: { permission: 'dept:read' } },
      ],
    },
  ],
})

// 全局前置守卫 — 自动拦截未登录 / 无权限
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) return '/login'
  if (to.meta.permission && !auth.hasPermission(to.meta.permission as string)) return '/login'
})
```

### 4.5 Axios 封装

```typescript
const api = axios.create({ baseURL: '/api', timeout: 15000 })

// 请求拦截器 — 自动带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器 — 自动解包 + 401 跳登录
api.interceptors.response.use(
  (res) => res.data,                    // 自动 .data 解包
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data ?? error)
  },
)
```

---

## 5. Naive UI 组件库

### 5.1 Provider 层级

```vue
<n-notification-provider>
  <n-message-provider>
    <n-dialog-provider>
      <router-view />
    </n-dialog-provider>
  </n-message-provider>
</n-notification-provider>
```

| Provider | 功能 | 对应 API |
|----------|------|----------|
| `n-message-provider` | 顶部消息提示 | `useMessage()` |
| `n-notification-provider` | 通知弹窗 | `useNotification()` |
| `n-dialog-provider` | 确认对话框 | `useDialog()` |

> **陷阱**: 用了 `useDialog()` 但漏了 `<n-dialog-provider>` → 白屏无报错。

### 5.2 常用组件

```vue
<!-- 卡片容器 -->
<n-card title="部门管理" class="h-full">
  <template #header-extra>
    <n-button @click="handleAdd">新增</n-button>
  </template>
  <!-- 内容 -->
</n-card>

<!-- 树形组件 -->
<n-tree
  :data="treeData"
  :render-label="renderLabel"
  expand-on-click
  :default-expanded-keys="expandedKeys"
/>

<!-- 数据表格 -->
<n-data-table :columns="columns" :data="data" :pagination="pagination" />

<!-- 表单 -->
<n-form ref="formRef" :model="form" :rules="rules">
  <n-form-item label="用户名" path="username">
    <n-input v-model:value="form.username" />
  </n-form-item>
</n-form>

<!-- 对话框 -->
<n-modal v-model:show="showModal" title="编辑用户">
  <n-form>...</n-form>
  <template #footer>
    <n-button @click="handleSave">保存</n-button>
  </template>
</n-modal>
```

### 5.3 渲染函数 h()

Naive UI 支持通过 `render` 函数灵活定制组件内容。本项目在树形节点中使用 `h()` 函数渲染操作按钮：

```typescript
function renderLabel({ option }: { option: TreeOption }) {
  return h('span', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '36px',
    },
  }, [
    h('span', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
      h('span', null, option.isLeaf ? '📄' : '📁'),
      h('span', {
        style: { fontWeight: option.children?.length ? 'bold' : 'normal' },
      }, option.label as string),
    ]),
    h('span', { style: { display: 'flex', gap: '4px' } }, [
      h('a', { style: 'cursor:pointer', onClick: () => handleEdit(option) }, '编辑'),
      h('a', { style: 'cursor:pointer;color:red', onClick: () => handleDelete(option) }, '删除'),
    ]),
  ])
}
```

---

## 6. 认证与授权 (RBAC)

### 6.1 架构图

```
请求 → [JwtAuthGuard] → 验证 JWT Token → [PermissionGuard] → 检查权限 → [Controller]
              ↑                              ↑
        Passport Strategy              @RequirePermission('user:read')
        从 token 解析 user             从 DB 查角色权限
```

### 6.2 JWT 认证流程

1. 用户 POST `/api/auth/login`（`@Public()` 标记公开）
2. `AuthService.login()` 校验用户名密码（SHA256 哈希）
3. 生成 JWT Token（`jwtService.sign({ sub: userId })`）
4. 返回 `{ accessToken, user: { ..., permissions } }`
5. 前端存 `accessToken` 到 `localStorage`
6. 后续请求自动通过 Axios 拦截器带 `Authorization: Bearer <token>`
7. `JwtAuthGuard` 全局守卫自动校验每个请求（除 `@Public()` 路由）

### 6.3 权限检查流程

1. `@RequirePermission('dept:read')` 在装饰器中注入元数据
2. `PermissionGuard.canActivate()` 从当前用户角色查权限集合
3. 检查用户是否拥有 `'*'`（超级管理员）或所有要求的权限
4. 不满足则抛 `ForbiddenException('权限不足')`

### 6.4 数据模型

```
User ──→ UserRole ──→ Role ──→ RolePermission
  │                     │           └─ permission: string ('dept:read')
  └── Department         └─ code: 'admin'
```

### 6.5 前端权限

```typescript
// 侧边栏菜单权限过滤
const menuOptions = computed(() =>
  allMenuItems.filter((item) => authStore.hasPermission(item.permission)),
)

// 路由守卫 — 无权限跳转登录页
if (to.meta.permission && !auth.hasPermission(to.meta.permission as string)) {
  return '/login'
}
```

---

## 7. 日志系统

### 7.1 Winston 日志

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',  // 环境变量控制
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
})
```

### 7.2 日志级别

```
error: ['error']
warn:  ['error', 'warn']
info:  ['error', 'warn', 'log']        ← 默认
debug: ['error', 'warn', 'log', 'debug']
```

### 7.3 请求日志拦截器

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const now = Date.now()

    return next.handle().pipe(
      tap(() => logger.log(`${method} ${url} ${Date.now() - now}ms`)),
    )
  }
}
```

### 7.4 异常日志 (Exception Filter)

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception instanceof PrismaClientKnownRequestError) {
      // 特殊处理 Prisma 错误
    }

    // 错误日志
    logger.error(`${request.method} ${request.url} - ${status} - ${message}`)
  }
}
```

---

## 8. API 设计模式

### 8.1 统一响应格式 (TransformInterceptor)

所有成功响应包装为统一格式：

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 8.2 统一错误格式 (AllExceptionsFilter)

所有错误响应包装为统一格式：

```json
{
  "success": false,
  "code": 400,
  "message": "部门名称 xxx 已存在",
  "data": null
}
```

### 8.3 泛型 CRUD 基类 (BaseService)

```typescript
abstract class BaseService<T, C, U, Q> {
  // 子类必须实现 — DTO 转 Prisma data
  protected abstract toCreateData(dto: C): Record<string, unknown>
  protected abstract toUpdateData(dto: U): Record<string, unknown>

  // 可选钩子
  protected async beforeCreate(_dto: C): Promise<void> {}
  protected async afterCreate(_entity: T): Promise<void> {}

  // 继承可用的 CRUD
  async findAll(query?: Q): Promise<PaginatedResult<T>>
  async findOne(id: number): Promise<T>
  async create(dto: C): Promise<T>
  async update(id: number, dto: U): Promise<T>
  async remove(id: number): Promise<{ id: number }>
}
```

**设计模式**: 模板方法模式 — 基类定义骨架，子类实现/覆盖具体步骤。

### 8.4 分页查询

```typescript
// 请求: GET /api/users?page=1&pageSize=20&keyword=张三
// 响应:
{
  "list": [...],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

### 8.5 统一前缀

```typescript
app.setGlobalPrefix('api')  // 所有路由挂载在 /api/ 下
```

### 8.6 参数校验 (ValidationPipe)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,                    // 自动剔除未定义的字段
    transform: true,                    // 自动类型转换 (string → number)
    forbidNonWhitelisted: true,         // 拒绝未定义的字段（抛异常）
  }),
)
```

对应 DTO 使用 `class-validator` 装饰器：

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[]
}
```

---

## 9. 共享包 (@nest/shared) {#9-共享包-nestshared}

### 9.1 用途

`shared/` 包被 `server/` 和 `web/` 同时引用，用于共享：

- **TypeScript 类型定义** — 确保前后端类型一致
- **权限常量** — 避免 magic string

### 9.2 类型共享

```typescript
// shared/src/types/common.ts
export interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

### 9.3 常量共享

```typescript
// shared/src/constants/permissions.ts
export const Permissions = {
  DEPT_READ: 'dept:read',
  USER_READ: 'user:read',
  ROLE_READ: 'role:read',
  // ...
} as const
```

### 9.4 跨包引用

`package.json` 中通过 workspace 协议引用：

```json
{
  "dependencies": {
    "@nest/shared": "workspace:*"
  }
}
```

---

## 10. 知识库模块 (Knowledge Module)

### 10.1 用途

知识库模块是一个教学辅助功能，将全栈技术栈知识点存入数据库，在欢迎页分类展示。新人可以边操作项目边查阅知识点，不用切出去看文档。

### 10.2 数据模型 {#知识库模块数据模型}

```prisma
model Knowledge {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  content   String   @db.Text
  category  String   @db.VarChar(50)  // architecture | nestjs | prisma | frontend | auth | patterns | logging | pitfalls
  tags      String?  @db.VarChar(200) // 逗号分隔
  sort      Int      @default(0)
  status    Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("knowledge")
}
```

### 10.3 API 设计

```typescript
// GET /api/knowledge — 获取全部分类，按 category 分组
// 响应:
[
  {
    "category": "nestjs",
    "label": "NestJS 核心",
    "icon": "⚡",
    "items": [
      { "id": 1, "title": "依赖注入 (DI)", "content": "..." },
      ...
    ]
  }
]

// GET /api/knowledge/:id — 获取单条详情
```

### 10.4 分组展示逻辑

KnowledgeService.getCategories() 从 DB 取数据，按 category 分组，保持预定义顺序：

```typescript
const categoryOrder = ['architecture', 'nestjs', 'prisma', 'frontend', 'auth', 'patterns', 'logging', 'pitfalls']
```

每个分类有中文 label 和图标，通过 categoryMeta 映射表维护。新增分类只需加映射。

### 10.5 种子数据

prisma/seed.ts 中包含 30+ 条知识条目，覆盖全部技术点。运行 `pnpm prisma:seed` 填充。

---

## 11. 并发控制演示 (Concurrency Module)

### 11.1 用途

并发控制演示是一个互动教学工具。通过一个**计数器自增**场景，展示三种并发控制方式的差异：

1. **无保护** — 读→写三步拆开，放大竞态窗口
2. **async-mutex** — 应用层互斥锁，同一进程内串行
3. **SELECT FOR UPDATE** — 数据库行级锁，跨进程生效

### 11.2 背景：什么是竞态 (Race Condition)

```
时间 →  请求 A              请求 B
         read count=0
                           read count=0
         write count=1
                           write count=1  ← 期望 2，实际 1！
```

计数器期望值 = 请求次数 (N)。无保护时最终值 ≤ N, 丢失的更新数 = 竞态的严重程度。

### 11.3 数据模型

```prisma
model Counter {
  id      Int    @id @default(autoincrement())
  name    String @unique @db.VarChar(100)
  value   Int    @default(0)
  version Int    @default(0)
  @@map("counters")
}
```

### 11.4 API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/concurrency/increment-naive/:name` | 无保护增量（演示竞态） |
| `POST` | `/api/concurrency/increment-mutex/:name` | async-mutex 互斥锁 |
| `POST` | `/api/concurrency/increment-locked/:name` | DB 行锁 |
| `GET`  | `/api/concurrency/counters` | 获取所有计数器 |
| `POST` | `/api/concurrency/reset/:name` | 重置计数器为 0 |

### 11.5 三种实现对比

#### 方式 1: 无保护（演示问题）

```typescript
async incrementNaive(name: string) {
  let counter = await this.prisma.counter.findUnique({ where: { name } })
  if (!counter) counter = await this.prisma.counter.create({ data: { name, value: 0 } })
  await this.sleep(50) // 模拟业务耗时，放大竞态窗口
  return this.prisma.counter.update({
    where: { name },
    data: { value: counter.value + 1 }, // 基于过期值！
  })
}
```

#### 方式 2: async-mutex（进程内互斥锁）

```typescript
import { Mutex } from 'async-mutex'

private readonly mutexes = new Map<string, Mutex>()

async incrementMutex(name: string) {
  let mutex = this.mutexes.get(name)
  if (!mutex) { mutex = new Mutex(); this.mutexes.set(name, mutex) }

  return mutex.runExclusive(async () => {
    let counter = await this.prisma.counter.findUnique({ where: { name } })
    if (!counter) counter = await this.prisma.counter.create({ data: { name, value: 0 } })
    await this.sleep(50)
    return this.prisma.counter.update({
      where: { name },
      data: { value: counter.value + 1 },
    })
  })
}
```

**原理**: async-mutex 的 `runExclusive()` 确保同一时间只有一个回调在执行。其他请求排队等待。但只在单进程内有效——多个服务器实例之间需要分布式锁。

#### 方式 3: SELECT FOR UPDATE（数据库行锁）

```typescript
async incrementLocked(name: string) {
  return this.prisma.$transaction(async (tx) => {
    let counter = await tx.counter.findUnique({ where: { name } })
    if (!counter) counter = await tx.counter.create({ data: { name, value: 0 } })

    // 行锁：显式锁定该行，其他事务等待
    const [locked] = await tx.$queryRawUnsafe<{ value: number }[]>(
      'SELECT value FROM counters WHERE name = $1 FOR UPDATE',
      name,
    )
    await this.sleep(50)

    const newValue = locked.value + 1
    await tx.counter.update({ where: { name }, data: { value: newValue } })
    return tx.counter.findUnique({ where: { name } })
  })
}
```

**原理**: PostgreSQL 的 `SELECT ... FOR UPDATE` 是行级锁。事务 A 锁住行后，事务 B 的 FOR UPDATE 会阻塞等待 A 提交或回滚。跨进程生效（多个服务器实例也能正确同步）。

### 11.6 三种方式核心差异

| | 无保护 | async-mutex | SELECT FOR UPDATE |
|--|--------|-------------|-------------------|
| **是否丢更新** | ❌ 会（演示目标） | ✅ 不会 | ✅ 不会 |
| **适用范围** | — | 单进程 | 跨进程/多实例 |
| **性能** | 最高 | 中等（排队） | 中等（DB 锁等待） |
| **复杂度** | 无 | 低 | 中（需原生 SQL） |
| **教学意义** | 看到问题 | 应用层方案 | 数据库方案 |

### 11.7 前端演示

ConcurrencyDemo.vue 提供三个按钮，分别触发 10 次并发请求：

- **"无保护"**: 发起 10 个 POST `/concurrency/increment-naive/demo-counter` — 观察值小于 10
- **"async-mutex"**: 10 个 POST `/concurrency/increment-mutex/demo-counter` — 最终值 10
- **"行锁"**: 10 个 POST `/concurrency/increment-locked/demo-counter` — 最终值 10

每次点击"重置"将计数器归零。页面显示每次请求的中间值和最终对比。

---

## 12. pnpm Monorepo

### 12.1 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'server'
  - 'web'
  - 'shared'
```

### 12.2 workspace 协议的优点

- `workspace:*` 自动解析为本地包的当前版本
- 无需 `npm link`
- 一次 `pnpm install` 安装所有依赖
- 共享 `node_modules` 减少磁盘占用

### 12.3 常用命令

```bash
pnpm install              # 安装所有包的所有依赖
pnpm --filter @nest/server dev    # 启动后端开发
pnpm --filter @nest/web dev       # 启动前端开发
pnpm --filter @nest/web build     # 构建前端
```

---

## 13. 实战经验总结

### 13.1 常见陷阱

| 陷阱 | 现象 | 解决方案 |
|------|------|----------|
| 缺少 `<n-dialog-provider>` | 白屏无报错 | 检查 Provider 层级 |
| `$on('query')` 在 Driver Adapter 下不工作 | SQL 不打印 | 改用 `log: ['query']` |
| Prisma P2002 `(not available)` | 重复键无明确提示 | 手动查 + 事务判断 |
| Prisma 事务内用了外部 client | 事务不生效 | 必须用 `tx` 参数 |
| Admin 权限 `*` 前端不识别 | 登录成功但空白 | `includes('*') \|\| includes(perm)` |
| `ValidationPipe` 未配置 `forbidNonWhitelisted` | 多传字段不报错 | 开启白名单模式 |
| `TransformInterceptor` 没有 `|| null` | 返回空数据时 `data` 为 undefined | `data: data ?? null` |
| 树形组件 `checkable` 默认开启 | 部门树像权限选择器 | 明确关闭: `:checkable="false"` |

### 13.2 Prisma v7 Driver Adapter vs 传统模式

| 对比项 | 传统模式 (Query Engine) | Driver Adapter (`@prisma/adapter-pg`) |
|--------|------------------------|--------------------------------------|
| 部署依赖 | 需要二进制文件 | 纯 JS/TS，无二进制 |
| 性能 | 一般 | 更好（原生绑定） |
| `$on('query')` | 支持 | ⚠️ 不支持 |
| `log: ['query']` | 支持 | 支持 |
| Docker 构建 | 需要二进制下载 | 更简单 |

### 13.3 从 Spring Boot 迁移到 NestJS

| Spring Boot → | NestJS |
|---------------|--------|
| `@RestController` | `@Controller()` |
| `@Service` | `@Injectable()` |
| `@Autowired` | 构造函数注入 |
| `@Valid @Validated` | `ValidationPipe` + `class-validator` |
| `HandlerInterceptor` | `NestInterceptor` |
| `@ExceptionHandler` | `ExceptionFilter` |
| `SecurityFilterChain` | `Guard` |
| `JPA Entity` | Prisma Schema |
| `@Profile("dev")` | `NODE_ENV` 环境变量 |
| `application.yml` | `.env` + `@nestjs/config` |
| Maven/Gradle | pnpm workspace |

### 13.4 性能优化建议

1. **Prisma select 瘦身**: 只查需要的字段，避免 `select: { id: true, name: true }`
2. **N+1 查询预防**: 使用 Prisma `include` 一次加载关联，不用在循环中查询
3. **分页必须加 `take`**: `findMany` 不加 `take`=全表扫描
4. **日志级别生产降级**: 生产环境关闭 `query` 日志
5. **事务范围最小化**: 事务内只做必须的操作，不要包含 HTTP 调用

---

> 本文档持续更新。如有遗漏或改进建议，欢迎补充。
