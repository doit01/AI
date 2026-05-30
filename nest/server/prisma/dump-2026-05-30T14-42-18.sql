-- ============================================
-- Nest PMS 数据库全量导出
-- 导出时间: 2026/5/30 22:42:18
-- 注意: 导入前需先建表 (prisma migrate deploy)
-- ============================================

BEGIN;

-- counters (1 行)

INSERT INTO "counters" ("id", "name", "value", "version") VALUES
(1, 'demo-counter', 0, 0);
SELECT setval(pg_get_serial_sequence('"counters"', 'id'), COALESCE((SELECT MAX("id") FROM "counters"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='counters' AND column_name='id' AND column_default LIKE 'nextval%');

-- departments (8 行)

INSERT INTO "departments" ("id", "name", "parentId", "sort", "status", "createdAt", "updatedAt") VALUES
(1, '总公司', NULL, 1, 1, '2026-05-30T05:08:27.838Z', '2026-05-30T05:08:27.838Z'),
(2, '技术部', 1, 1, 1, '2026-05-30T05:08:27.851Z', '2026-05-30T05:08:27.851Z'),
(3, '前端组', 2, 1, 1, '2026-05-30T05:08:27.859Z', '2026-05-30T05:08:27.859Z'),
(4, '后端组', 2, 2, 1, '2026-05-30T05:08:27.865Z', '2026-05-30T05:08:27.865Z'),
(5, '市场部', 1, 2, 1, '2026-05-30T05:08:27.871Z', '2026-05-30T05:08:27.871Z'),
(6, '财务部', 1, 3, 1, '2026-05-30T05:08:27.876Z', '2026-05-30T05:08:27.876Z'),
(10, '2', 1, 0, 1, '2026-05-30T09:39:51.298Z', '2026-05-30T09:39:51.298Z'),
(7, '人事部', 1, 4, 1, '2026-05-30T13:52:42.237Z', '2026-05-30T13:52:42.237Z');
SELECT setval(pg_get_serial_sequence('"departments"', 'id'), COALESCE((SELECT MAX("id") FROM "departments"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='id' AND column_default LIKE 'nextval%');

-- knowledge (44 行)

INSERT INTO "knowledge" ("id", "title", "content", "category", "tags", "sort", "status", "createdAt", "updatedAt") VALUES
(42, 'Monorepo 三包结构', '项目使用 pnpm workspace 管理三个独立包：server/ (NestJS 后端)、web/ (Vue 3 前端)、shared/ (共享类型与常量)。包间通过 workspace:* 协议引用，一次 pnpm install 安装所有依赖。', 'architecture', 'monorepo,pnpm,workspace', 1, 1, '2026-05-30T14:08:23.496Z', '2026-05-30T14:08:23.496Z'),
(43, 'server/ 后端分层', 'NestJS 采用模块化架构：Module 组织业务单元，Controller 处理 HTTP 路由，Service 封装业务逻辑，PrismaService 负责数据库访问。全局注册 Guard/Interceptor/Filter/Pipe 实现横切关注点。', 'architecture', 'nestjs,module,layered-architecture', 2, 1, '2026-05-30T14:08:23.506Z', '2026-05-30T14:08:23.506Z'),
(44, 'web/ 前端技术栈', 'Vue 3 + Vite + TypeScript + Pinia + Vue Router + Naive UI。Vite 提供秒级 HMR，Pinia 管理状态，Vue Router 处理路由守卫，Naive UI 提供开箱即用的企业级 UI 组件。', 'architecture', 'vue,vite,pinia,router,naive-ui', 3, 1, '2026-05-30T14:08:23.508Z', '2026-05-30T14:08:23.508Z'),
(45, 'shared/ 共享包设计', 'shared/ 包被 server 和 web 同时引用，存放前后端共用的 TypeScript 类型 (ApiResponse, PaginatedResult) 和权限常量 (ALL_PERMISSIONS)。避免前后端类型定义不同步。', 'architecture', 'shared,types,constants', 4, 1, '2026-05-30T14:08:23.510Z', '2026-05-30T14:08:23.510Z'),
(46, '依赖注入 (DI)', 'NestJS 使用构造函数注入。所有 @Injectable() 装饰的类由 IoC 容器管理。PrismaService 在 PrismaModule 中标记 @Global() + exports，使其他模块无需 import 即可注入。', 'nestjs', 'nestjs,di,ioc,injection', 1, 1, '2026-05-30T14:08:23.511Z', '2026-05-30T14:08:23.511Z'),
(47, 'Controller + Route', '@Controller(''departments'') 将路由挂载到 /api/departments (结合 main.ts 的 setGlobalPrefix(''api''))。方法装饰器 @Get()/@Post()/@Patch()/@Delete() 映射 HTTP 方法。', 'nestjs', 'nestjs,controller,routing', 2, 1, '2026-05-30T14:08:23.512Z', '2026-05-30T14:08:23.512Z'),
(48, 'Guard 守卫', 'JwtAuthGuard 继承 PassportStrategy 自动校验 JWT Token。PermissionGuard 读取 @RequirePermission() 元数据，从数据库查用户权限。两者通过 APP_GUARD 全局注册。', 'nestjs', 'nestjs,guard,jwt,rbac,authorization', 3, 1, '2026-05-30T14:08:23.513Z', '2026-05-30T14:08:23.513Z'),
(49, 'Interceptor 拦截器', 'TransformInterceptor 将成功响应统一包装为 { success, code, message, data }。LoggingInterceptor 记录请求方法和耗时。通过 APP_INTERCEPTOR 全局注册。', 'nestjs', 'nestjs,interceptor,aop,logging', 4, 1, '2026-05-30T14:08:23.514Z', '2026-05-30T14:08:23.514Z'),
(50, 'ExceptionFilter 异常过滤器', 'AllExceptionsFilter 捕获所有未处理异常，根据类型返回不同状态码和结构化错误信息。特殊处理 Prisma P2002 (唯一约束冲突) 和自定义 ApiException。', 'nestjs', 'nestjs,exception-filter,error-handling', 5, 1, '2026-05-30T14:08:23.515Z', '2026-05-30T14:08:23.515Z'),
(51, 'ValidationPipe 参数校验', '全局 ValidationPipe 配置 whitelist: true (自动剔除未定义字段)、transform: true (自动类型转换)、forbidNonWhitelisted: true (拒绝未定义字段)。配合 class-validator 装饰器在 DTO 中声明校验规则。', 'nestjs', 'nestjs,validation,dto,pipe', 6, 1, '2026-05-30T14:08:23.517Z', '2026-05-30T14:08:23.517Z'),
(52, '自定义装饰器', '@Public() — 跳过 JWT 校验 (通过 SetMetadata 和 Reflector 配合)。@RequirePermission(''user:read'') — 给路由绑定所需权限。@CurrentUser() — 从 request.user 提取当前登录用户。', 'nestjs', 'nestjs,decorator,metadata', 7, 1, '2026-05-30T14:08:23.519Z', '2026-05-30T14:08:23.519Z'),
(53, 'ConfigModule 环境变量', '@nestjs/config 读取 .env 文件并全局注入。通过 ConfigService.get(''JWT_SECRET'') 获取配置。支持 LOG_LEVEL、PORT、DATABASE_URL 等自定义变量。', 'nestjs', 'nestjs,config,environment', 8, 1, '2026-05-30T14:08:23.520Z', '2026-05-30T14:08:23.520Z'),
(54, 'Schema 驱动开发', 'prisma/schema.prisma 声明数据模型 (Model)，Prisma 自动生成类型安全 Client。修改 schema 后运行 prisma migrate dev 创建迁移，再运行 prisma generate 更新 Client 代码。', 'prisma', 'prisma,schema,migration,orm', 1, 1, '2026-05-30T14:08:23.522Z', '2026-05-30T14:08:23.522Z'),
(55, 'CRUD 操作全解', 'prisma.department.findMany({ where, orderBy, skip, take })、findUnique({ where: { id } })、create({ data })、update({ where, data })、delete({ where })。所有操作自动类型检查。', 'prisma', 'prisma,crud,query', 2, 1, '2026-05-30T14:08:23.524Z', '2026-05-30T14:08:23.524Z'),
(56, '关联查询 (include)', 'Prisma 的 include 支持嵌套查询：user → roles → role → permissions。深度关联可一次性加载完整数据树，避免 N+1 查询问题。', 'prisma', 'prisma,include,relation,n-plus-one', 3, 1, '2026-05-30T14:08:23.526Z', '2026-05-30T14:08:23.526Z'),
(57, 'Prisma 事务', '交互式事务 prisma.$transaction(async (tx) => { ... }) 保证多个数据库操作原子性。事务内必须使用 tx 参数 (不是外部的 this.prisma)。用于部门重名检查 + 创建的 TOCTOU 防护。', 'prisma', 'prisma,transaction,toctou,atomic', 4, 1, '2026-05-30T14:08:23.528Z', '2026-05-30T14:08:23.528Z'),
(58, '交互式事务实战 (TOCTOU 防护)', '部门创建时需避免竞态：多个请求同时创建同名部门。方案：在 $transaction 内先 findFirst 查重再 create，两步原子执行。

代码示例：
await prisma.$transaction(async (tx) => {
  const existing = await tx.department.findFirst({ where: { name } })
  if (existing) throw new ConflictException(`名称"${name}"已存在`)
  return tx.department.create({ data: { name } })
})

关键：使用 tx 参数而非外部 prisma，否则不在同一事务中，依然有 TOCTOU。更新时需排除自身：findFirst({ where: { name, id: { not } }})。', 'prisma', 'prisma,transaction,toctou,conflict,code-example', 5, 1, '2026-05-30T14:08:23.529Z', '2026-05-30T14:08:23.529Z'),
(59, 'Driver Adapter 新架构', '@prisma/adapter-pg 替代传统 Query Engine，无需二进制文件，部署更轻量。但 $on(''query'') 事件不工作，query 日志需改用 log: [''query''] 配置走 stdout。', 'prisma', 'prisma,driver-adapter,adapter-pg,logging', 5, 1, '2026-05-30T14:08:23.531Z', '2026-05-30T14:08:23.531Z'),
(60, '表名映射 (@@map)', 'Prisma 默认使用模型名复数作为表名。@@map("users") 显式指定表名。@map("user_id") 可映射字段名。避免表名与数据库关键字冲突或风格不一致。', 'prisma', 'prisma,map,naming', 6, 1, '2026-05-30T14:08:23.533Z', '2026-05-30T14:08:23.533Z'),
(61, '开发迁移: migrate dev', 'prisma migrate dev 用于开发环境。它会检测 schema 变更 → 自动生成 migration.sql 文件 → 执行到本地数据库 → 并可选重置数据。每次 schema 改动后运行此命令，生成的迁移文件需提交到 Git。', 'prisma', 'prisma,migration,dev,schema-change', 7, 1, '2026-05-30T14:08:23.534Z', '2026-05-30T14:08:23.534Z'),
(62, '生产迁移: migrate deploy', 'prisma migrate deploy 用于生产环境。它只执行 migrations/ 目录中尚未应用的 .sql 文件，不会创建新迁移文件或重置数据。生产部署流程：本地改 schema → migrate dev 生成迁移 → 提交 Git → 部署时跑 migrate deploy + generate。', 'prisma', 'prisma,migration,production,deploy', 8, 1, '2026-05-30T14:08:23.536Z', '2026-05-30T14:08:23.536Z'),
(63, '生产加字段安全步骤', '生产环境加字段需分步进行避免锁表或丢数据：

第一步：只加 nullable 字段或有默认值的字段 → prisma migrate deploy
第二步：填充数据（执行 SQL UPDATE 补值）
第三步：如需要再改 NOT NULL 约束 → 第二次 deploy

禁止一步到位加 NOT NULL 无默认值字段，会导致已有行写入失败。', 'prisma', 'prisma,migration,safe-deploy,schema-change', 9, 1, '2026-05-30T14:08:23.538Z', '2026-05-30T14:08:23.538Z'),
(64, 'Composition API', '使用 <script setup lang="ts"> 语法。ref() 声明响应式数据，computed() 声明计算属性，onMounted() 处理生命周期。比 Options API 更灵活，类型推断更好。', 'frontend', 'vue,composition-api,setup,ref', 1, 1, '2026-05-30T14:08:23.540Z', '2026-05-30T14:08:23.540Z'),
(65, 'Pinia 状态管理', 'defineStore(''auth'', () => { ... }) 定义 Store。user、isLoggedIn 为状态，login()、logout() 为 action，permissions 为 getter。支持在组件外使用 (如 router guard)。', 'frontend', 'pinia,store,state-management', 2, 1, '2026-05-30T14:08:23.542Z', '2026-05-30T14:08:23.542Z'),
(66, 'Vue Router 路由守卫', 'router.beforeEach() 全局前置守卫：未登录用户访问非公开路由 → 跳 /login；有权限要求但不满足 → 跳 /login。meta 字段传递公共标记和权限要求。', 'frontend', 'vue-router,guard,navigation', 3, 1, '2026-05-30T14:08:23.543Z', '2026-05-30T14:08:23.543Z'),
(67, 'Axios 封装技巧', '请求拦截器自动带 Bearer Token。响应拦截器自动 res.data 解包 (后端 TransformInterceptor 的外层)。401 状态自动清除 token 并跳登录页。', 'frontend', 'axios,interceptor,http,token', 4, 1, '2026-05-30T14:08:23.544Z', '2026-05-30T14:08:23.544Z'),
(68, 'Naive UI Provider 层级', 'App.vue 必须包裹 n-notification-provider → n-message-provider → n-dialog-provider。缺少任一 Provider 会导致 useMessage()/useDialog() 白屏无报错。', 'frontend', 'naive-ui,provider,notification,dialog', 5, 1, '2026-05-30T14:08:23.546Z', '2026-05-30T14:08:23.546Z'),
(69, 'JWT 认证流程', '登录 POST /api/auth/login → AuthService 校验用户名密码 (SHA256) → JwtService.sign({ sub: userId }) → 返回 accessToken → 前端存 localStorage → 后续请求自动带 Authorization: Bearer header。', 'auth', 'jwt,auth,login,token', 1, 1, '2026-05-30T14:08:23.548Z', '2026-05-30T14:08:23.548Z'),
(70, 'RBAC 权限模型', 'User → UserRole (多对多) → Role → RolePermission。用户拥有角色，角色拥有权限。PermissionGuard 从 DB 查询当前用户的所有角色权限，与 @RequirePermission() 对比。', 'auth', 'rbac,role,permission,authorization', 2, 1, '2026-05-30T14:08:23.549Z', '2026-05-30T14:08:23.549Z'),
(71, '通配符权限 (*)', '超级管理员角色只有一个权限 "*"，表示拥有全部权限。前后端判断时需 includes(''*'') || includes(perm)。这是 RBAC 中常见的超级管理员模式。', 'auth', 'rbac,wildcard,super-admin', 3, 1, '2026-05-30T14:08:23.550Z', '2026-05-30T14:08:23.550Z'),
(72, '前端权限双重过滤', '侧边栏菜单用 permission 字段 + hasPermission() 过滤。路由用 meta.permission + beforeEach 守卫拦截。按钮级使用 v-if="hasPermission(''dept:create'')" 控制可见性。', 'auth', 'frontend,permission,menu,guard', 4, 1, '2026-05-30T14:08:23.551Z', '2026-05-30T14:08:23.551Z'),
(73, '模板方法模式 (BaseService)', 'BaseService 定义 CRUD 骨架和抽象方法 toCreateData()/toUpdateData()，子类实现具体的数据转换逻辑。钩子方法 beforeCreate()/afterCreate() 提供扩展点。', 'patterns', 'template-method,inheritance,base-service', 1, 1, '2026-05-30T14:08:23.552Z', '2026-05-30T14:08:23.552Z'),
(74, '管道过滤模式 (请求链)', 'NestJS 请求按管道顺序处理：Guard → Interceptor → Pipe → Controller。每个阶段可以拒绝请求或转换数据。类似 UNIX 管道或 Spring Boot Filter 链。', 'patterns', 'pipeline,chain-of-responsibility,aop', 2, 1, '2026-05-30T14:08:23.553Z', '2026-05-30T14:08:23.553Z'),
(75, 'DTO 模式 + 参数校验', 'CreateUserDto / UpdateUserDto 用 class-validator 装饰器声明规则 (IsString, IsOptional, MinLength, IsArray)。ValidationPipe 的 whitelist 自动剔除未声明字段，防止 Mass Assignment 攻击。', 'patterns', 'dto,validation,security,mass-assignment', 3, 1, '2026-05-30T14:08:23.554Z', '2026-05-30T14:08:23.554Z'),
(76, '树形递归 (buildTree)', 'DepartmentService.buildTree() 递归将扁平部门列表转为树形结构。从 parentId=null 的根节点开始，逐层匹配 children。树形结构适用于组织架构、分类目录、评论楼层等场景。', 'patterns', 'tree,recursion,flatten-to-tree', 4, 1, '2026-05-30T14:08:23.555Z', '2026-05-30T14:08:23.555Z'),
(77, '策略模式 (PassportStrategy)', '@nestjs/passport 的策略模式可灵活切换认证方式：JWT Strategy、OAuth2 Strategy、Local Strategy。每种策略实现 validate() 方法即可。', 'patterns', 'strategy,passport,authentication', 5, 1, '2026-05-30T14:08:23.556Z', '2026-05-30T14:08:23.556Z'),
(78, 'Winston 日志配置', 'Winston 支持多 Transport：Console、File (combined.log + error.log)。格式 JSON 便于日志分析系统 (ELK) 消费。日志级别由 LOG_LEVEL 环境变量控制。', 'logging', 'winston,logging,transport', 1, 1, '2026-05-30T14:08:23.557Z', '2026-05-30T14:08:23.557Z'),
(79, '日志级别映射', 'LOG_LEVEL 控制 NestJS Logger 级别：error→只有 error；warn→error+warn；info→error+warn+log；debug→+debug；verbose→+verbose。生产环境推荐 info，开发环境推荐 debug。', 'logging', 'logging,log-level,debug', 2, 1, '2026-05-30T14:08:23.558Z', '2026-05-30T14:08:23.558Z'),
(80, 'Prisma 日志: stdout vs $on()', 'Prisma v7 Driver Adapter 模式下，$on(''query'') 事件监听不可用。改用 PrismaClient({ log: [''query'', ''info'', ''warn'', ''error''] }) 走 stdout。生产环境关闭 query 日志以避免性能开销和 SQL 泄露。', 'logging', 'prisma,logging,sql,driver-adapter', 3, 1, '2026-05-30T14:08:23.559Z', '2026-05-30T14:08:23.559Z'),
(81, '缺少 Naive UI Provider', '用了 useDialog() 但 App.vue 没包 <n-dialog-provider> → 白屏无任何报错。任何 useMessage()/useNotification()/useDialog() 都需要对应 Provider。', 'pitfalls', 'naive-ui,provider,white-screen', 1, 1, '2026-05-30T14:08:23.561Z', '2026-05-30T14:08:23.561Z'),
(82, 'Prisma 事务客户端混淆', 'prisma.$transaction(async (tx) => { ... }) 事务内必须使用 tx 参数操作数据库。使用外部 this.prisma 的操作将不会回滚。', 'pitfalls', 'prisma,transaction,rollback', 2, 1, '2026-05-30T14:08:23.562Z', '2026-05-30T14:08:23.562Z'),
(83, 'TransformInterceptor 空值', 'TransformInterceptor 的 data: data ?? null 确保后端返回 null 时 data 字段依旧存在。否则前端解构 res.data.data 会 undefined。', 'pitfalls', 'interceptor,null,response', 3, 1, '2026-05-30T14:08:23.563Z', '2026-05-30T14:08:23.563Z'),
(84, 'Prisma P2002 (not available)', 'Prisma v7 Driver Adapter 的 P2002 错误中 constraint 字段显示 (not available)。因为 driver-adapter 路径下 error.detail 不可用。手动查重 + 事务处理更可靠。', 'pitfalls', 'prisma,error,p2002,duplicate', 4, 1, '2026-05-30T14:08:23.564Z', '2026-05-30T14:08:23.564Z'),
(85, 'NestJS 全局 Pipe 需手动注册', 'APP_PIPE 的 useFactory 比 useClass 更灵活，可传参数 (whitelist, transform, forbidNonWhitelisted)。否则默认 ValidationPipe 只校验不转换。', 'pitfalls', 'nestjs,pipe,validation,config', 5, 1, '2026-05-30T14:08:23.565Z', '2026-05-30T14:08:23.565Z');
SELECT setval(pg_get_serial_sequence('"knowledge"', 'id'), COALESCE((SELECT MAX("id") FROM "knowledge"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='knowledge' AND column_name='id' AND column_default LIKE 'nextval%');

-- role_permissions (16 行)

INSERT INTO "role_permissions" ("id", "roleId", "permission") VALUES
(1, 1, '*'),
(2, 2, 'user:create'),
(3, 2, 'user:read'),
(4, 2, 'user:update'),
(5, 2, 'user:delete'),
(6, 2, 'role:create'),
(7, 2, 'role:read'),
(8, 2, 'role:update'),
(9, 2, 'role:delete'),
(10, 2, 'dept:create'),
(11, 2, 'dept:read'),
(12, 2, 'dept:update'),
(13, 2, 'dept:delete'),
(14, 3, 'user:read'),
(15, 3, 'dept:read'),
(16, 4, 'user:read');
SELECT setval(pg_get_serial_sequence('"role_permissions"', 'id'), COALESCE((SELECT MAX("id") FROM "role_permissions"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='id' AND column_default LIKE 'nextval%');

-- roles (4 行)

INSERT INTO "roles" ("id", "name", "code", "description", "status", "createdAt", "updatedAt") VALUES
(1, '超级管理员', 'admin', '系统超级管理员，拥有所有权限', 1, '2026-05-30T05:08:27.887Z', '2026-05-30T05:08:27.887Z'),
(2, '系统管理员', 'sysadmin', '系统管理员，管理所有模块', 1, '2026-05-30T05:08:27.892Z', '2026-05-30T05:08:27.892Z'),
(3, '人事主管', 'hr-manager', '人事主管，可查看用户和部门', 1, '2026-05-30T05:08:27.897Z', '2026-05-30T05:08:27.897Z'),
(4, '普通用户', 'user', '普通用户，仅有基础查看权限', 1, '2026-05-30T05:08:27.901Z', '2026-05-30T05:08:27.901Z');
SELECT setval(pg_get_serial_sequence('"roles"', 'id'), COALESCE((SELECT MAX("id") FROM "roles"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='id' AND column_default LIKE 'nextval%');

-- user_roles (5 行)

INSERT INTO "user_roles" ("userId", "roleId") VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 4);
SELECT setval(pg_get_serial_sequence('"user_roles"', 'id'), COALESCE((SELECT MAX("id") FROM "user_roles"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='id' AND column_default LIKE 'nextval%');

-- users (6 行)

INSERT INTO "users" ("id", "username", "password", "realName", "email", "phone", "avatar", "departmentId", "status", "createdAt", "updatedAt") VALUES
(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '系统管理员', 'admin@example.com', '13800000001', NULL, NULL, 1, '2026-05-30T05:08:27.963Z', '2026-05-30T05:08:27.963Z'),
(2, 'sysadmin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '张三丰', 'sysadmin@example.com', '13800000002', NULL, 2, 1, '2026-05-30T05:08:27.968Z', '2026-05-30T05:08:27.968Z'),
(4, 'lisi', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '李小明', 'lisi@example.com', '13800000004', NULL, 3, 1, '2026-05-30T05:08:27.978Z', '2026-05-30T05:08:27.978Z'),
(5, 'wangwu', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '王大锤', 'wangwu@example.com', '13800000005', NULL, 4, 1, '2026-05-30T05:08:27.983Z', '2026-05-30T05:08:27.983Z'),
(6, 'zhaoqi', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '赵大勇（已离职）', 'zhaoqi@example.com', NULL, NULL, 5, 0, '2026-05-30T05:08:27.990Z', '2026-05-30T05:08:27.990Z'),
(3, 'zhangsan', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '张秋菊', 'zhangsan@example.com', '13800000003', NULL, NULL, 1, '2026-05-30T05:08:27.974Z', '2026-05-30T05:08:27.974Z');
SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX("id") FROM "users"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='id' AND column_default LIKE 'nextval%');

COMMIT;
