# Spring StateMachine 三层实体 Demo 设计文档

## 概述

在 `demo` 项目中实现 Project → Process → Batch → OperationStep 三层实体层级，使用 Spring StateMachine 4.0.2 + `spring-statemachine-data-jpa` 管理三个有状态实体的状态流转，并提供 Vue 3 + NaiveUI 单页展示。

## 实体层级

```
Project (项目) → Process (工艺, 无状态) → Batch (批次) → OperationStep (操作步骤)
```

| 实体 | 有状态机 | 状态 |
|------|----------|------|
| Project | ✅ | CREATE → FINISH / CANCEL |
| Process | ❌ | 仅容器，无状态 |
| Batch | ✅ | CREATE → PRODUCTION → RELEASING → FINISH / CANCEL |
| OperationStep | ✅ | CREATE → EXECUTED { SHORT, EXCEED, SKIP } |

## 状态机详细设计

### 1. ProjectStateMachine

**States:** CREATE(initial), FINISH(end), CANCEL(end)

**Events:** FINISH_PROJECT, CANCEL_PROJECT

**Transitions:**

| Source | Target | Event | Guard | Action |
|--------|--------|-------|-------|--------|
| CREATE | FINISH | FINISH_PROJECT | 所有 Batch 是 FINISH 状态 | Project.state = FINISH |
| CREATE | CANCEL | CANCEL_PROJECT | 无 | Project.state = CANCEL |

### 2. BatchStateMachine

**States:** CREATE(initial), PRODUCTION, RELEASING, FINISH(end), CANCEL(end)

**Events:** START_PRODUCTION, START_RELEASING, COMPLETE_RELEASING, CANCEL_BATCH

**Transitions:**

| Source | Target | Event | Guard | Action |
|--------|--------|-------|-------|--------|
| CREATE | PRODUCTION | START_PRODUCTION | 无 | Batch.state = PRODUCTION |
| PRODUCTION | RELEASING | START_RELEASING | 无 | Batch.state = RELEASING |
| RELEASING | FINISH | COMPLETE_RELEASING | 所有 Step 是 EXECUTED 状态 | Batch.state = FINISH |
| CREATE | CANCEL | CANCEL_BATCH | 无 | Batch.state = CANCEL |
| PRODUCTION | CANCEL | CANCEL_BATCH | 无 | Batch.state = CANCEL |
| RELEASING | CANCEL | CANCEL_BATCH | 无 | Batch.state = CANCEL |

### 3. StepStateMachine

**States:** CREATE(initial), EXECUTED(composite)
- EXECUTED children: SHORT(initial), EXCEED, SKIP

**Events:** EXECUTE, MARK_SHORT, MARK_EXCEED, MARK_SKIP

**Transitions:**

| Source | Target | Event | Guard | Action |
|--------|--------|-------|-------|--------|
| CREATE | EXECUTED | EXECUTE | 无 | 进入 EXECUTED 区域, 默认 SHORT |
| SHORT | EXCEED | MARK_EXCEED | 当前在 SHORT | Step.resultType = EXCEED |
| SHORT | SKIP | MARK_SKIP | 当前在 SHORT | Step.resultType = SKIP |

## 技术方案

### 后端

**新增依赖:**
```groovy
implementation 'org.springframework.statemachine:spring-statemachine-data-jpa'
// 版本由 BOM 管理
```

**包结构 (`com.demo.ssm`):**
```
ssm/
├── project/
│   ├── Project.java              — @Entity
│   ├── ProjectState.java         — enum
│   ├── ProjectEvent.java         — enum
│   ├── ProjectStateMachineConfig.java — @EnableStateMachineFactory
│   ├── ProjectRepository.java
│   ├── ProjectService.java
│   ├── ProjectController.java
│   └── ProjectDto.java
├── process/
│   ├── Process.java              — @Entity (无状态机)
│   ├── ProcessRepository.java
│   ├── ProcessService.java
│   ├── ProcessController.java
│   └── ProcessDto.java
├── batch/
│   ├── Batch.java
│   ├── BatchState.java
│   ├── BatchEvent.java
│   ├── BatchStateMachineConfig.java
│   ├── BatchRepository.java
│   ├── BatchService.java
│   ├── BatchController.java
│   └── BatchDto.java
├── step/
│   ├── Step.java
│   ├── StepState.java
│   ├── StepEvent.java
│   ├── StepStateMachineConfig.java
│   ├── StepRepository.java
│   ├── StepService.java
│   ├── StepController.java
│   └── StepDto.java
├── config/
│   └── SsmPersistConfig.java     — StateMachineRuntimePersister Bean
├── States.java                   — (保留现有学习代码)
├── Events.java                   — (保留现有学习代码)
├── Config1.java                  — (保留现有学习代码)
└── StateMachineConfig.java       — (保留现有学习代码)
```

**JPA 持久化:** `SSM_RUNTIME` 表存放状态机上下文, 实体表 (`project`, `batch`, `step`) 额外存 `state` 字段以便查询。

- `spring-statemachine-data-jpa` 自动创建 `SSM_RUNTIME` 表
- `JpaRepositoryStateMachinePersist` 负责持久化/恢复
- `StateMachineRuntimePersister<State, Event, String>` 注入到 Service 层

**Service 核心模式:**
```java
// 每个 sendEvent 方法:
StateMachine<S, E> machine = factory.getStateMachine(String.valueOf(id));
persister.restore(machine, String.valueOf(id));
machine.sendEvent(event);
persister.persist(machine, String.valueOf(id));
// 同时更新实体 state 字段
```

**Guards 实现:**
- `AllBatchesFinishedGuard`: 查该 Project 下所有 Batch 是否 state = FINISH
- `AllStepsExecutedGuard`: 查该 Batch 下所有 Step 是否 state = EXECUTED

**API 端点:**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ssm/tree` | 全量树数据 (Project → Process → Batch → Step) |
| POST | `/api/ssm/projects` | 创建 Project |
| POST | `/api/ssm/projects/{id}/events` | Project 触发事件 |
| GET | `/api/ssm/projects/{id}/machine` | 查询 Project 状态机详情 |
| POST | `/api/ssm/processes` | 创建 Process |
| POST | `/api/ssm/batches` | 创建 Batch |
| POST | `/api/ssm/batches/{id}/events` | Batch 触发事件 |
| GET | `/api/ssm/batches/{id}/machine` | 查询 Batch 状态机详情 |
| POST | `/api/ssm/steps` | 创建 Step |
| POST | `/api/ssm/steps/{id}/events` | Step 触发事件 |
| GET | `/api/ssm/steps/{id}/machine` | 查询 Step 状态机详情 |

### 前端

**新增页面:** `ui/src/views/ssm/index.vue`

**路由:** `/ssm` - 单页树形展示

**布局:** 两栏:
- 左侧: `NTree` 展示 Project → Process → Batch → Step 层级
- 右侧: 选中实体的详情面板
  - 实体信息 (name, code, 当前 state 用 NTag 彩色标签)
  - 可用操作按钮 (动态渲染)
  - 子级状态列表

**API 封装:** `ui/src/api/index.ts` 新增 `ssm` namespace

**菜单:** `App.vue` 新增侧边栏菜单项 "状态机演示"

### 数据初始化

`DataInitializer` 添加测试数据:
- 1 个 Project (CREATE)
- 1 个 Process
- 2 个 Batch (CREATE, PRODUCTION)
- 4 个 Step (CREATE, CREATE, CREATE, SHORT)

## 不涉及范围

- 不引入 Redis
- 不引入消息队列
- 不实现分布式状态机协调
- 不实现权限/认证

## 现有代码保留

`com.demo.ssm` 下原有的学习代码 (`States.java`, `Events.java`, `Config1.java`, `StateMachineConfig.java`, `read.txt`) 全部保留不动。新增的实体状态机放在各自子包中。
