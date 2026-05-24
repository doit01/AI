# Harness 项目 — 用户偏好 & 使用指引

## 技术栈
- **后端**: Spring Boot 4.0.5 / Spring Framework 7 / JDK 25 / Gradle / JPA / PostgreSQL
- **前端**: Vue 3 / TypeScript / NaiveUI / UnoCSS / Bun / Vite
- **构建**: Gradle（Aliyun Maven 镜像 `https://maven.aliyun.com/repository/public`）、Bun
- **ORM**: Spring Data JPA（双向关联需同步双方集合）
- **代码简化**: Lombok（实体 @Getter @Setter，DTO @Data + record，Service/Controller @RequiredArgsConstructor）
- **容器化**: Jib 插件（无 Dockerfile）
- **数据库**: PostgreSQL 18.4 原生运行，localhost:5432，用户 `86152`，无密码，库 `demo`
- **DDL**: `spring.jpa.hibernate.ddl-auto=update` 自动建表
- **端口**: 后端 8080 / 前端 3000

## 项目结构
```
harness/
├── demo/
│   ├── backend/               # 按领域分包
│   │   └── src/main/java/com/demo/
│   │       ├── common/         — BaseEntity (@MappedSuperclass)
│   │       ├── config/         — CorsConfig, DataInitializer
│   │       ├── department/     — Department (entity/repo/service/controller/dto)
│   │       ├── user/           — User
│   │       ├── role/           — Role
│   │       ├── menu/           — Menu
│   │       └── manytomany/     — Student ↔ Course
│   └── frontend/               — Vue 3 + NaiveUI + UnoCSS
│       └── src/views/
│           ├── department/     — 部门树 + 人员表格
│           ├── user/           — 用户 CRUD
│           ├── role/           — 角色 CRUD
│           ├── menu/           — 菜单树
│           └── manytomany/     — 学生 ↔ 课程 选课管理
├── .opencode/                  — opencode 配置 (命令/MCP/权限)
├── scripts/                    — dev.ps1 / setup.ps1
├── opencode.jsonc              — agents/commands/MCP servers
└── AGENTS.md                   — (合并至此文件)
```

## JPA 关联关系
| 关系 | 实体 | 说明 |
|------|------|------|
| @OneToMany 自引用 | Department → Department | 部门树（parent/children） |
| @ManyToOne | User → Department | 用户所属部门 |
| @ManyToMany | User ↔ Role | 用户-角色（sys_user_role） |
| @ManyToMany | Role ↔ Menu | 角色-菜单（sys_role_menu） |
| @OneToMany 自引用 | Menu → Menu | 菜单树（parent/children） |
| @ManyToMany | Student ↔ Course | 学生选课（mm_student_course） |

## 启动方式
```bash
opencode run dev
# 或手动:
cd demo/backend  && gradle bootRun   # http://localhost:8080
cd demo/frontend && bun run dev      # http://localhost:3000
```

## 可用 opencode 命令
| 命令 | 操作 |
|------|------|
| `opencode run dev` | 启动全部 |
| `opencode run db` | Docker PG (可选) |
| `opencode run backend:run` | 启动后端 |
| `opencode run frontend:dev` | 启动前端 |
| `opencode run frontend:build` | 构建前端 |
| `opencode run backend:build` | 构建后端 |
| `opencode run docker:build` | Jib 构建镜像 |
| `opencode run test` | 运行测试 |
| `ultrawork <任务>` / `ulw <任务>` | OMO 多智能体编排 |
| `@oracle <问题>` | OMO 架构/决策 |
| `@librarian <问题>` | OMO 研究/查找 |

## 数据初始化
`DataInitializer` 首次启动自动插入测试数据（5 部门 + 4 用户 + 3 角色 + 5 菜单 + 3 课程 + 2 学生），检测到有数据自动跳过。

## 开发环境
- **OS**: Windows（PowerShell）
- **curl 中文**: 用临时文件 + `@filename` 方式发送（PowerShell 直接传中文会乱码）
- **项目根**: `C:\Users\86152\ai\harness`

## 代码风格
- 不用注释（除非明确要求）
- 不用 emoji（除非明确要求）
- 实体类不加 @EqualsAndHashCode / @ToString（避免 Lazy 代理问题）
- 所有 @OneToMany / @ManyToMany 用 `Set<Entity>` + `LinkedHashSet`，不用 List
- DTO 用 Java `record` + `@Builder`，加 Jakarta Validation 注解
- Controller @RequestBody 加 `@Valid`

## 可用技能
### 始终可用（项目相关）
- `springboot-patterns`、`java-coding-standards`、`coding-standards`
- `frontend-patterns`、`api-design`、`backend-patterns`

### 按需触发
- 测试: `springboot-tdd`、`e2e-testing`、`tdd-workflow`
- 上线: `springboot-verification`、`verification-loop`
- UI: `frontend-design`
- 决策: `council`
- MCP: `mcp-server-patterns`
- opencode 配置: `customize-opencode`、`configure-ecc`
- 其他: `code-tour`、`continuous-learning`、`hookify-rules`

## 已安装工具
- **Oh My OpenAgent (OMO)**: 全局安装 (`~/.config/opencode/`)，项目内用 `ultrawork`/`ulw` 触发多智能体协作
- **RTK (Rust Token Killer)**: 已安装 (`rtk.exe`)，自动拦截 bash 命令输出并压缩，减少 60-90% token 消耗。插件位于 `~/.config/opencode/plugins/rtk.ts`
- **DCP (Dynamic Context Pruning)**: 已配置 (`@tarquinen/opencode-dcp`)，自动裁剪对话历史中过时的工具输出，节省上下文空间

