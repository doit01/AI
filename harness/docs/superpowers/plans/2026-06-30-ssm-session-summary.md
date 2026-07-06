# SSM Demo 开发会话摘要 (2026-06-30)

## 已完成

### 后端 (全部在 `com.demo.ssm` 包下)
- **依赖**: build.gradle 添加 spring-statemachine-data-jpa (BOM 管理版本)
- **实体**:
  - `ssm/project/` — Project (@Entity), ProjectState/ProjectEvent enums, ProjectRepository, ProjectDto
  - `ssm/process/` — Process (@Entity, 无状态机), ProcessRepository, ProcessDto
  - `ssm/batch/` — Batch (@Entity), BatchState/BatchEvent enums, BatchRepository, BatchDto
  - `ssm/step/` — Step (@Entity, 含 resultType), StepState/StepEvent enums, StepRepository, StepDto
- **状态机配置 (3个 @EnableStateMachineFactory)**:
  - ProjectStateMachineConfig — CREATE→FINISH/CANCEL
  - BatchStateMachineConfig — CREATE→PRODUCTION→RELEASING→FINISH/CANCEL
  - StepStateMachineConfig — CREATE→EXECUTED{SHORT,EXCEED,SKIP} (composite state)
- **持久化**: `SsmPersistConfig` — 1 个 `StateMachineRuntimePersister` (给 config 注入) + 3 个 `StateMachinePersister` (给 service 注入)
- **Service/Controller**:
  - ProjectService: list/get/create/sendEvent (含 guard: 检查所有 Batch FINISH)
  - BatchService: list/create/sendEvent (含 guard: 检查所有 Step EXECUTED)
  - StepService: list/create/sendEvent (EXECUTE→SHORT, MARK_EXCEED/SKIP→设 resultType)
  - ProcessService: list/create
  - SsmTreeController: GET /api/ssm/tree 全量层级
- **DataInitializer**: 添加 SSM 测试数据 (1 Project + 1 Process + 2 Batch + 6 Step)

### 前端
- `api/index.ts` — 添加 ssm tree/sendEvent
- `router/index.ts` — 添加 /ssm 路由
- `App.vue` — 添加"状态机演示"菜单项 (GitBranchOutline 图标)
- `views/ssm/index.vue` — 两栏页面: 左侧 NTree 展示层级, 右侧详情+操作按钮

### 构建验证
- `gradlew clean compileJava` — BUILD SUCCESSFUL
- `bun run build` — ✓ built successfully

## 明天可继续

1. **首次启动验证**: `gradlew bootRun` 启动后端, 验证 `/api/ssm/tree` 返回数据
2. **启动前端**: `bun run dev` 验证 UI 页面
3. **端到端测试**: 创建 Project→Process→Batch→Step→发送事件
4. **可能的修复**: 首次启动时 StateMachineRuntimePersister 可能需调试
5. **README/文档**: 如有需要

## 后端启动
```
cd demo/backend && gradlew bootRun
```

## 前端启动
```
cd demo/ui && bun run dev
```
