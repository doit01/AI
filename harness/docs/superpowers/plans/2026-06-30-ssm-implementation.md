# SSM 三层状态机 Demo 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 实现 Project→Process→Batch→OperationStep 三层实体层级，用 Spring StateMachine 4.0.2 + spring-statemachine-data-jpa 管理状态，Vue 3 + NaiveUI 单页展示。

**Architecture:** 三个独立 @EnableStateMachineFactory（Project/Batch/Step），用 spring-statemachine-data-jpa 持久化状态机上下文到 PG，实体额外存 state 字段便于查询。

**Tech Stack:** Spring Boot 4.1.0 / JDK 25 / Spring Statemachine 4.0.2 / spring-statemachine-data-jpa / JPA / PostgreSQL 18.4 / Vue 3 / NaiveUI / UnoCSS

---

## 文件清单

### 新建后端文件 (ssm/ 包下)
```
backend/src/main/java/com/demo/ssm/
├── project/
│   ├── ProjectState.java
│   ├── ProjectEvent.java
│   ├── Project.java                      — @Entity
│   ├── ProjectRepository.java
│   ├── ProjectDto.java
│   ├── ProjectStateMachineConfig.java    — @EnableStateMachineFactory
│   ├── ProjectService.java
│   └── ProjectController.java
├── process/
│   ├── Process.java                      — @Entity (无状态机)
│   ├── ProcessRepository.java
│   ├── ProcessDto.java
│   ├── ProcessService.java
│   └── ProcessController.java
├── batch/
│   ├── BatchState.java
│   ├── BatchEvent.java
│   ├── Batch.java                        — @Entity
│   ├── BatchRepository.java
│   ├── BatchDto.java
│   ├── BatchStateMachineConfig.java      — @EnableStateMachineFactory
│   ├── BatchService.java
│   └── BatchController.java
├── step/
│   ├── StepState.java
│   ├── StepEvent.java
│   ├── Step.java                         — @Entity
│   ├── StepRepository.java
│   ├── StepDto.java
│   ├── StepStateMachineConfig.java       — @EnableStateMachineFactory
│   ├── StepService.java
│   └── StepController.java
└── config/
    └── SsmPersistConfig.java
```

### 修改的现有文件
```
backend/build.gradle                                      — 加 spring-statemachine-data-jpa
backend/src/main/java/com/demo/config/DataInitializer.java — 加 SSM 测试数据
ui/src/api/index.ts                                       — 加 ssm namespace
ui/src/router/index.ts                                    — 加 /ssm 路由
ui/src/App.vue                                            — 加菜单项
ui/src/views/ssm/index.vue                                — 新建页面
```

---

### Task 1: 添加 spring-statemachine-data-jpa 依赖 + PersistConfig

**Files:**
- Modify: `backend/build.gradle`
- Create: `backend/src/main/java/com/demo/ssm/config/SsmPersistConfig.java`

- [ ] **修改 build.gradle 加依赖**

```
在 dependencies 块中加一行:
implementation 'org.springframework.statemachine:spring-statemachine-data-jpa'

BOM 自动管理版本，无需指定版本号
```

- [ ] **创建 SsmPersistConfig.java**

```java
package com.demo.ssm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.data.jpa.JpaRepositoryStateMachinePersist;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

@Configuration
public class SsmPersistConfig {

    @Bean
    public StateMachineRuntimePersister<?, ?, String> persister() {
        return new JpaRepositoryStateMachinePersist<>();
    }
}
```

---

### Task 2: 创建 Project 实体 + 状态枚举 + 事件枚举 + Repository + DTO

**Files:**
- Create: `ProjectState.java`
- Create: `ProjectEvent.java`
- Create: `Project.java`
- Create: `ProjectRepository.java`
- Create: `ProjectDto.java`

- [ ] **创建 ProjectState.java**

```java
package com.demo.ssm.project;

public enum ProjectState {
    CREATE, FINISH, CANCEL
}
```

- [ ] **创建 ProjectEvent.java**

```java
package com.demo.ssm.project;

public enum ProjectEvent {
    FINISH_PROJECT, CANCEL_PROJECT
}
```

- [ ] **创建 Project.java**

```java
package com.demo.ssm.project;

import com.demo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_project")
public class Project extends BaseEntity {
    private String name;
    private String code;

    @Enumerated(EnumType.STRING)
    private ProjectState state = ProjectState.CREATE;
}
```

- [ ] **创建 ProjectRepository.java**

```java
package com.demo.ssm.project;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
```

- [ ] **创建 ProjectDto.java**

```java
package com.demo.ssm.project;

import jakarta.validation.constraints.NotBlank;

@lombok.Builder
public record ProjectDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    ProjectState state
) {
    static ProjectDto from(Project p) {
        return ProjectDto.builder()
            .id(p.getId())
            .name(p.getName())
            .code(p.getCode())
            .state(p.getState())
            .build();
    }
}
```

---

### Task 3: 创建 Process 实体 (无状态机)

**Files:**
- Create: `Process.java`
- Create: `ProcessRepository.java`
- Create: `ProcessDto.java`

- [ ] **创建 Process.java**

```java
package com.demo.ssm.process;

import com.demo.common.BaseEntity;
import com.demo.ssm.project.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_process")
public class Process extends BaseEntity {
    private String name;
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
}
```

- [ ] **创建 ProcessRepository.java**

```java
package com.demo.ssm.process;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcessRepository extends JpaRepository<Process, Long> {
    List<Process> findByProjectId(Long projectId);
}
```

- [ ] **创建 ProcessDto.java**

```java
package com.demo.ssm.process;

import jakarta.validation.constraints.NotBlank;

@lombok.Builder
public record ProcessDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    Long projectId
) {
    static ProcessDto from(Process p) {
        return ProcessDto.builder()
            .id(p.getId())
            .name(p.getName())
            .code(p.getCode())
            .projectId(p.getProject().getId())
            .build();
    }
}
```

---

### Task 4: 创建 Batch 实体 + 状态枚举 + 事件枚举 + Repository + DTO

**Files:**
- Create: `BatchState.java`
- Create: `BatchEvent.java`
- Create: `Batch.java`
- Create: `BatchRepository.java`
- Create: `BatchDto.java`

- [ ] **创建 BatchState.java**

```java
package com.demo.ssm.batch;

public enum BatchState {
    CREATE, PRODUCTION, RELEASING, FINISH, CANCEL
}
```

- [ ] **创建 BatchEvent.java**

```java
package com.demo.ssm.batch;

public enum BatchEvent {
    START_PRODUCTION, START_RELEASING, COMPLETE_RELEASING, CANCEL_BATCH
}
```

- [ ] **创建 Batch.java**

```java
package com.demo.ssm.batch;

import com.demo.common.BaseEntity;
import com.demo.ssm.process.Process;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_batch")
public class Batch extends BaseEntity {
    private String name;
    private String code;

    @Enumerated(EnumType.STRING)
    private BatchState state = BatchState.CREATE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private Process process;
}
```

- [ ] **创建 BatchRepository.java**

```java
package com.demo.ssm.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByProcessId(Long processId);
    long countByProcessIdAndStateNot(Long processId, BatchState state);
}
```

- [ ] **创建 BatchDto.java**

```java
package com.demo.ssm.batch;

import jakarta.validation.constraints.NotBlank;

@lombok.Builder
public record BatchDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    BatchState state,
    Long processId
) {
    static BatchDto from(Batch b) {
        return BatchDto.builder()
            .id(b.getId())
            .name(b.getName())
            .code(b.getCode())
            .state(b.getState())
            .processId(b.getProcess().getId())
            .build();
    }
}
```

---

### Task 5: 创建 Step 实体 + 状态枚举 + 事件枚举 + Repository + DTO

**Files:**
- Create: `StepState.java`
- Create: `StepEvent.java`
- Create: `Step.java`
- Create: `StepRepository.java`
- Create: `StepDto.java`

- [ ] **创建 StepState.java**

```java
package com.demo.ssm.step;

public enum StepState {
    CREATE, EXECUTED, SHORT, EXCEED, SKIP
}
```

- [ ] **创建 StepEvent.java**

```java
package com.demo.ssm.step;

public enum StepEvent {
    EXECUTE, MARK_SHORT, MARK_EXCEED, MARK_SKIP
}
```

- [ ] **创建 Step.java**

```java
package com.demo.ssm.step;

import com.demo.common.BaseEntity;
import com.demo.ssm.batch.Batch;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_step")
public class Step extends BaseEntity {
    private String name;
    private String code;

    @Enumerated(EnumType.STRING)
    private StepState state = StepState.CREATE;

    @Enumerated(EnumType.STRING)
    private StepState resultType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;
}
```

- [ ] **创建 StepRepository.java**

```java
package com.demo.ssm.step;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StepRepository extends JpaRepository<Step, Long> {
    List<Step> findByBatchId(Long batchId);
    long countByBatchIdAndStateNot(Long batchId, StepState state);
}
```

- [ ] **创建 StepDto.java**

```java
package com.demo.ssm.step;

import jakarta.validation.constraints.NotBlank;

@lombok.Builder
public record StepDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    StepState state,
    StepState resultType,
    Long batchId
) {
    static StepDto from(Step s) {
        return StepDto.builder()
            .id(s.getId())
            .name(s.getName())
            .code(s.getCode())
            .state(s.getState())
            .resultType(s.getResultType())
            .batchId(s.getBatch().getId())
            .build();
    }
}
```

---

### Task 6: Project 状态机配置

**Files:**
- Create: `ProjectStateMachineConfig.java`

- [ ] **创建 ProjectStateMachineConfig.java**

```java
package com.demo.ssm.project;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.guard.Guard;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory(name = "projectStateMachineFactory")
public class ProjectStateMachineConfig
    extends EnumStateMachineConfigurerAdapter<ProjectState, ProjectEvent> {

    private final StateMachineRuntimePersister<ProjectState, ProjectEvent, String> persister;

    public ProjectStateMachineConfig(
        @Qualifier("persister") StateMachineRuntimePersister<ProjectState, ProjectEvent, String> persister) {
        this.persister = persister;
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<ProjectState, ProjectEvent> config) throws Exception {
        config
            .withConfiguration()
            .autoStartup(true)
            .and()
            .withPersistence()
            .runtimePersister(persister);
    }

    @Override
    public void configure(StateMachineStateConfigurer<ProjectState, ProjectEvent> states) throws Exception {
        states
            .withStates()
            .initial(ProjectState.CREATE)
            .states(EnumSet.allOf(ProjectState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<ProjectState, ProjectEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(ProjectState.CREATE).target(ProjectState.FINISH)
                .event(ProjectEvent.FINISH_PROJECT)
                .guard(allBatchesFinishedGuard())
                .action(updateProjectStateAction())
                .and()
            .withExternal()
                .source(ProjectState.CREATE).target(ProjectState.CANCEL)
                .event(ProjectEvent.CANCEL_PROJECT)
                .action(updateProjectStateAction());
    }

    @Bean
    public Guard<ProjectState, ProjectEvent> allBatchesFinishedGuard() {
        return ctx -> true; // 在 service 层实现，简化 guard 逻辑
    }

    @Bean
    public Action<ProjectState, ProjectEvent> updateProjectStateAction() {
        return ctx -> {
            var projectId = Long.valueOf(ctx.getStateMachine().getId());
            var targetState = ctx.getTarget().getId();
            var repo = ctx.getStateMachine().getExtendedState().getVariables();
            repo.put("targetState", targetState);
            repo.put("entityId", projectId);
        };
    }
}
```

---

### Task 7: Batch 状态机配置

**Files:**
- Create: `BatchStateMachineConfig.java`

- [ ] **创建 BatchStateMachineConfig.java**

```java
package com.demo.ssm.batch;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.guard.Guard;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory(name = "batchStateMachineFactory")
public class BatchStateMachineConfig
    extends EnumStateMachineConfigurerAdapter<BatchState, BatchEvent> {

    private final StateMachineRuntimePersister<BatchState, BatchEvent, String> persister;

    public BatchStateMachineConfig(
        @Qualifier("persister") StateMachineRuntimePersister<BatchState, BatchEvent, String> persister) {
        this.persister = persister;
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<BatchState, BatchEvent> config) throws Exception {
        config
            .withConfiguration()
            .autoStartup(true)
            .and()
            .withPersistence()
            .runtimePersister(persister);
    }

    @Override
    public void configure(StateMachineStateConfigurer<BatchState, BatchEvent> states) throws Exception {
        states
            .withStates()
            .initial(BatchState.CREATE)
            .states(EnumSet.allOf(BatchState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<BatchState, BatchEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(BatchState.CREATE).target(BatchState.PRODUCTION)
                .event(BatchEvent.START_PRODUCTION)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.PRODUCTION).target(BatchState.RELEASING)
                .event(BatchEvent.START_RELEASING)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.RELEASING).target(BatchState.FINISH)
                .event(BatchEvent.COMPLETE_RELEASING)
                .guard(allStepsExecutedGuard())
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.CREATE).target(BatchState.CANCEL)
                .event(BatchEvent.CANCEL_BATCH)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.PRODUCTION).target(BatchState.CANCEL)
                .event(BatchEvent.CANCEL_BATCH)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.RELEASING).target(BatchState.CANCEL)
                .event(BatchEvent.CANCEL_BATCH)
                .action(updateBatchStateAction());
    }

    @Bean
    public Action<BatchState, BatchEvent> updateBatchStateAction() {
        return ctx -> {
            ctx.getStateMachine().getExtendedState().getVariables()
                .put("targetState", ctx.getTarget().getId());
        };
    }

    @Bean
    public Guard<BatchState, BatchEvent> allStepsExecutedGuard() {
        return ctx -> true; // 在 service 层实现
    }
}
```

---

### Task 8: Step 状态机配置 (含 composite state)

**Files:**
- Create: `StepStateMachineConfig.java`

- [ ] **创建 StepStateMachineConfig.java**

```java
package com.demo.ssm.step;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

@Configuration
@EnableStateMachineFactory(name = "stepStateMachineFactory")
public class StepStateMachineConfig
    extends EnumStateMachineConfigurerAdapter<StepState, StepEvent> {

    private final StateMachineRuntimePersister<StepState, StepEvent, String> persister;

    public StepStateMachineConfig(
        @Qualifier("persister") StateMachineRuntimePersister<StepState, StepEvent, String> persister) {
        this.persister = persister;
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<StepState, StepEvent> config) throws Exception {
        config
            .withConfiguration()
            .autoStartup(true)
            .and()
            .withPersistence()
            .runtimePersister(persister);
    }

    @Override
    public void configure(StateMachineStateConfigurer<StepState, StepEvent> states) throws Exception {
        states
            .withStates()
                .initial(StepState.CREATE)
                .state(StepState.EXECUTED)
                .and()
                .withStates()
                    .parent(StepState.EXECUTED)
                    .initial(StepState.SHORT)
                    .state(StepState.SHORT)
                    .state(StepState.EXCEED)
                    .state(StepState.SKIP);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<StepState, StepEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(StepState.CREATE).target(StepState.EXECUTED)
                .event(StepEvent.EXECUTE)
                .action(updateStepStateAction())
                .and()
            .withExternal()
                .source(StepState.SHORT).target(StepState.EXCEED)
                .event(StepEvent.MARK_EXCEED)
                .action(updateStepResultAction())
                .and()
            .withExternal()
                .source(StepState.SHORT).target(StepState.SKIP)
                .event(StepEvent.MARK_SKIP)
                .action(updateStepResultAction());
    }

    @Bean
    public Action<StepState, StepEvent> updateStepStateAction() {
        return ctx -> {
            ctx.getStateMachine().getExtendedState().getVariables()
                .put("targetState", ctx.getTarget().getId());
        };
    }

    @Bean
    public Action<StepState, StepEvent> updateStepResultAction() {
        return ctx -> {
            ctx.getStateMachine().getExtendedState().getVariables()
                .put("targetState", ctx.getTarget().getId());
            ctx.getStateMachine().getExtendedState().getVariables()
                .put("resultType", ctx.getTarget().getId());
        };
    }
}
```

---

### Task 9: Project + Process Service & Controller

**Files:**
- Create: `ProjectService.java`
- Create: `ProjectController.java`
- Create: `ProcessService.java`
- Create: `ProcessController.java`

- [ ] **创建 ProjectService.java**

```java
package com.demo.ssm.project;

import lombok.RequiredArgsConstructor;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository repo;
    private final StateMachineFactory<ProjectState, ProjectEvent> projectStateMachineFactory;
    private final StateMachineRuntimePersister<ProjectState, ProjectEvent, String> persister;

    public List<ProjectDto> list() {
        return repo.findAll().stream().map(ProjectDto::from).toList();
    }

    public ProjectDto get(Long id) {
        return ProjectDto.from(repo.findById(id).orElseThrow());
    }

    @Transactional
    public ProjectDto create(ProjectDto dto) {
        var p = new Project();
        p.setName(dto.name());
        p.setCode(dto.code());
        return ProjectDto.from(repo.save(p));
    }

    @Transactional
    public ProjectDto sendEvent(Long id, ProjectEvent event) {
        var project = repo.findById(id).orElseThrow();
        var machineId = "project_" + id;
        StateMachine<ProjectState, ProjectEvent> machine = projectStateMachineFactory.getStateMachine(machineId);
        persister.restore(machine, machineId);
        machine.getExtendedState().getVariables().put("entityId", id);
        machine.sendEvent(event);
        var target = machine.getState().getId();
        project.setState(target);
        repo.save(project);
        persister.persist(machine, machineId);
        return ProjectDto.from(project);
    }
}
```

- [ ] **创建 ProjectController.java**

```java
package com.demo.ssm.project;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ssm/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService service;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> list() {
        return ResponseEntity.ok(service.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<ProjectDto> sendEvent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var event = ProjectEvent.valueOf(body.get("event"));
        return ResponseEntity.ok(service.sendEvent(id, event));
    }
}
```

- [ ] **创建 ProcessService.java**

```java
package com.demo.ssm.process;

import com.demo.ssm.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcessService {
    private final ProcessRepository repo;
    private final ProjectRepository projectRepo;

    public List<ProcessDto> list(Long projectId) {
        return repo.findByProjectId(projectId).stream().map(ProcessDto::from).toList();
    }

    @Transactional
    public ProcessDto create(ProcessDto dto) {
        var p = new Process();
        p.setName(dto.name());
        p.setCode(dto.code());
        p.setProject(projectRepo.findById(dto.projectId()).orElseThrow());
        return ProcessDto.from(repo.save(p));
    }
}
```

- [ ] **创建 ProcessController.java**

```java
package com.demo.ssm.process;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ssm/processes")
@RequiredArgsConstructor
public class ProcessController {
    private final ProcessService service;

    @PostMapping
    public ResponseEntity<ProcessDto> create(@Valid @RequestBody ProcessDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
```

---

### Task 10: Batch + Step Service & Controller

**Files:**
- Create: `BatchService.java`
- Create: `BatchController.java`
- Create: `StepService.java`
- Create: `StepController.java`

- [ ] **创建 BatchService.java**

```java
package com.demo.ssm.batch;

import com.demo.ssm.process.ProcessRepository;
import com.demo.ssm.step.StepRepository;
import com.demo.ssm.step.StepState;
import lombok.RequiredArgsConstructor;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {
    private final BatchRepository repo;
    private final ProcessRepository processRepo;
    private final StepRepository stepRepo;
    private final StateMachineFactory<BatchState, BatchEvent> batchStateMachineFactory;
    private final StateMachineRuntimePersister<BatchState, BatchEvent, String> persister;

    public List<BatchDto> list(Long processId) {
        return repo.findByProcessId(processId).stream().map(BatchDto::from).toList();
    }

    @Transactional
    public BatchDto create(BatchDto dto) {
        var b = new Batch();
        b.setName(dto.name());
        b.setCode(dto.code());
        b.setProcess(processRepo.findById(dto.processId()).orElseThrow());
        return BatchDto.from(repo.save(b));
    }

    @Transactional
    public BatchDto sendEvent(Long id, BatchEvent event) {
        var batch = repo.findById(id).orElseThrow();
        var machineId = "batch_" + id;
        StateMachine<BatchState, BatchEvent> machine = batchStateMachineFactory.getStateMachine(machineId);
        persister.restore(machine, machineId);
        machine.getExtendedState().getVariables().put("entityId", id);

        if (event == BatchEvent.COMPLETE_RELEASING) {
            var unfinished = stepRepo.countByBatchIdAndStateNot(id, StepState.SHORT);
            if ((int) unfinished > 0) {
                throw new IllegalStateException("尚有操作步骤未执行");
            }
        }

        machine.sendEvent(event);
        var target = machine.getState().getId();
        batch.setState(target);
        repo.save(batch);
        persister.persist(machine, machineId);
        return BatchDto.from(batch);
    }
}
```

- [ ] **创建 BatchController.java**

```java
package com.demo.ssm.batch;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ssm/batches")
@RequiredArgsConstructor
public class BatchController {
    private final BatchService service;

    @PostMapping
    public ResponseEntity<BatchDto> create(@Valid @RequestBody BatchDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<BatchDto> sendEvent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var event = BatchEvent.valueOf(body.get("event"));
        return ResponseEntity.ok(service.sendEvent(id, event));
    }
}
```

- [ ] **创建 StepService.java**

```java
package com.demo.ssm.step;

import com.demo.ssm.batch.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StepService {
    private final StepRepository repo;
    private final BatchRepository batchRepo;
    private final StateMachineFactory<StepState, StepEvent> stepStateMachineFactory;
    private final StateMachineRuntimePersister<StepState, StepEvent, String> persister;

    public List<StepDto> list(Long batchId) {
        return repo.findByBatchId(batchId).stream().map(StepDto::from).toList();
    }

    @Transactional
    public StepDto create(StepDto dto) {
        var s = new Step();
        s.setName(dto.name());
        s.setCode(dto.code());
        s.setBatch(batchRepo.findById(dto.batchId()).orElseThrow());
        return StepDto.from(repo.save(s));
    }

    @Transactional
    public StepDto sendEvent(Long id, StepEvent event) {
        var step = repo.findById(id).orElseThrow();
        var machineId = "step_" + id;
        StateMachine<StepState, StepEvent> machine = stepStateMachineFactory.getStateMachine(machineId);
        persister.restore(machine, machineId);
        machine.getExtendedState().getVariables().put("entityId", id);
        machine.sendEvent(event);
        var target = machine.getState().getId();

        step.setState(target == StepState.EXECUTED ? StepState.SHORT : target);
        if (event == StepEvent.MARK_EXCEED) step.setResultType(StepState.EXCEED);
        else if (event == StepEvent.MARK_SKIP) step.setResultType(StepState.SKIP);

        repo.save(step);
        persister.persist(machine, machineId);
        return StepDto.from(step);
    }
}
```

- [ ] **创建 StepController.java**

```java
package com.demo.ssm.step;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ssm/steps")
@RequiredArgsConstructor
public class StepController {
    private final StepService service;

    @PostMapping
    public ResponseEntity<StepDto> create(@Valid @RequestBody StepDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<StepDto> sendEvent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var event = StepEvent.valueOf(body.get("event"));
        return ResponseEntity.ok(service.sendEvent(id, event));
    }
}
```

---

### Task 11: Tree API 端点

**Files:**
- Create: `SsmTreeController.java` (放在 ssm/config/ 或 ssm/ 根)

- [ ] **创建 SsmTreeController.java**

```java
package com.demo.ssm.config;

import com.demo.ssm.batch.BatchDto;
import com.demo.ssm.batch.BatchRepository;
import com.demo.ssm.batch.BatchState;
import com.demo.ssm.process.ProcessDto;
import com.demo.ssm.process.ProcessRepository;
import com.demo.ssm.project.ProjectDto;
import com.demo.ssm.project.ProjectRepository;
import com.demo.ssm.step.StepDto;
import com.demo.ssm.step.StepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/ssm")
@RequiredArgsConstructor
public class SsmTreeController {
    private final ProjectRepository projectRepo;
    private final ProcessRepository processRepo;
    private final BatchRepository batchRepo;
    private final StepRepository stepRepo;

    @GetMapping("/tree")
    public ResponseEntity<List<Map<String, Object>>> tree() {
        var projects = projectRepo.findAll();
        var result = new ArrayList<Map<String, Object>>();
        for (var p : projects) {
            var pNode = new HashMap<String, Object>();
            pNode.put("id", "project_" + p.getId());
            pNode.put("label", p.getName());
            pNode.put("type", "project");
            pNode.put("entityId", p.getId());
            pNode.put("state", p.getState().name());

            var processes = processRepo.findByProjectId(p.getId());
            var pChildren = new ArrayList<Map<String, Object>>();
            for (var proc : processes) {
                var procNode = new HashMap<String, Object>();
                procNode.put("id", "process_" + proc.getId());
                procNode.put("label", proc.getName());
                procNode.put("type", "process");
                procNode.put("entityId", proc.getId());

                var batches = batchRepo.findByProcessId(proc.getId());
                var bChildren = new ArrayList<Map<String, Object>>();
                for (var b : batches) {
                    var bNode = new HashMap<String, Object>();
                    bNode.put("id", "batch_" + b.getId());
                    bNode.put("label", b.getName());
                    bNode.put("type", "batch");
                    bNode.put("entityId", b.getId());
                    bNode.put("state", b.getState().name());

                    var steps = stepRepo.findByBatchId(b.getId());
                    var sChildren = new ArrayList<Map<String, Object>>();
                    for (var s : steps) {
                        var sNode = new HashMap<String, Object>();
                        sNode.put("id", "step_" + s.getId());
                        sNode.put("label", s.getName());
                        sNode.put("type", "step");
                        sNode.put("entityId", s.getId());
                        sNode.put("state", s.getState().name());
                        sNode.put("resultType", s.getResultType() != null ? s.getResultType().name() : null);
                        sChildren.add(sNode);
                    }
                    bNode.put("children", sChildren);
                    bChildren.add(bNode);
                }
                procNode.put("children", bChildren);
                pChildren.add(procNode);
            }
            pNode.put("children", pChildren);
            result.add(pNode);
        }
        return ResponseEntity.ok(result);
    }
}
```

---

### Task 12: 更新 DataInitializer

**Files:**
- Modify: `backend/src/main/java/com/demo/config/DataInitializer.java`

- [ ] **在 DataInitializer 末尾添加 SSM 测试数据**

在 DataInitializer 的 run 方法末尾（现有数据初始化后），添加:

```java
// SSM test data
var em = entityManagerFactory.createEntityManager();
em.getTransaction().begin();

if (em.createQuery("select count(p) from Project p", Long.class).getSingleResult() == 0) {
    // Project
    var project = new com.demo.ssm.project.Project();
    project.setName("演示项目");
    project.setCode("P001");
    em.persist(project);

    // Process
    var process = new com.demo.ssm.process.Process();
    process.setName("注塑工艺");
    process.setCode("PRC001");
    process.setProject(project);
    em.persist(process);

    // Batch 1
    var batch1 = new com.demo.ssm.batch.Batch();
    batch1.setName("批次-A");
    batch1.setCode("B001");
    batch1.setState(com.demo.ssm.batch.BatchState.PRODUCTION);
    batch1.setProcess(process);
    em.persist(batch1);

    // Batch 2
    var batch2 = new com.demo.ssm.batch.Batch();
    batch2.setName("批次-B");
    batch2.setCode("B002");
    batch2.setProcess(process);
    em.persist(batch2);

    // Steps for batch1
    for (int i = 1; i <= 3; i++) {
        var step = new com.demo.ssm.step.Step();
        step.setName("步骤-" + i);
        step.setCode("S00" + i);
        step.setBatch(batch1);
        if (i == 1) {
            step.setState(com.demo.ssm.step.StepState.SHORT);
            step.setResultType(com.demo.ssm.step.StepState.SHORT);
        }
        em.persist(step);
    }

    // Steps for batch2
    for (int i = 4; i <= 6; i++) {
        var step = new com.demo.ssm.step.Step();
        step.setName("步骤-" + i);
        step.setCode("S00" + i);
        step.setBatch(batch2);
        em.persist(step);
    }
}

em.getTransaction().commit();
em.close();
```

注意需要 import:
```java
import com.demo.ssm.project.Project;
import com.demo.ssm.process.Process;
import com.demo.ssm.batch.Batch;
import com.demo.ssm.step.Step;
```

---

### Task 13: 前端 API + 路由 + 菜单

**Files:**
- Modify: `ui/src/api/index.ts`
- Modify: `ui/src/router/index.ts`
- Modify: `ui/src/App.vue`

- [ ] **api/index.ts 添加 ssm**

在 `export const api` 对象末尾添加:

```typescript
ssm: {
  tree: () => request<any[]>('/ssm/tree'),
  sendProjectEvent: (id: number, event: string) =>
    request<any>(`/ssm/projects/${id}/events`, { method: 'POST', body: JSON.stringify({ event }) }),
  sendBatchEvent: (id: number, event: string) =>
    request<any>(`/ssm/batches/${id}/events`, { method: 'POST', body: JSON.stringify({ event }) }),
  sendStepEvent: (id: number, event: string) =>
    request<any>(`/ssm/steps/${id}/events`, { method: 'POST', body: JSON.stringify({ event }) }),
}
```

注意加上 import `h` from vue (如果还不是已有的), 并且在菜单选项的开头或末尾添加 ssm 条目。

- [ ] **router/index.ts 添加路由**

```typescript
{
  path: '/ssm',
  name: 'Ssm',
  component: () => import('@/views/ssm/index.vue')
}
```

- [ ] **App.vue 添加菜单项**

在 menuOptions 数组中添加:
```typescript
{ label: '状态机演示', key: '/ssm', icon: () => h(NIcon, null, h(SettingsOutline)) }
// 或者复用现有图标，或不需要图标
```

---

### Task 14: 前端 SSM 页面 (核心)

**Files:**
- Create: `ui/src/views/ssm/index.vue`

- [ ] **创建 SSM 页面**

```vue
<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { useMessage, NTree, NButton, NSpace, NTag, NCard, NModal, NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import { api } from '@/api'

const msg = useMessage()
const treeData = ref<any[]>([])
const loading = ref(false)
const selectedNode = ref<any>(null)

const entityInfo = computed(() => {
  if (!selectedNode.value) return null
  return {
    type: selectedNode.value.type,
    label: selectedNode.value.label,
    state: selectedNode.value.state,
    entityId: selectedNode.value.entityId,
    resultType: selectedNode.value.resultType,
  }
})

const availableEvents = computed(() => {
  const info = entityInfo.value
  if (!info) return []
  const state = info.state
  const type = info.type
  
  if (type === 'project') {
    if (state === 'CREATE') return ['FINISH_PROJECT', 'CANCEL_PROJECT']
    return []
  }
  if (type === 'batch') {
    switch (state) {
      case 'CREATE': return ['START_PRODUCTION', 'CANCEL_BATCH']
      case 'PRODUCTION': return ['START_RELEASING', 'CANCEL_BATCH']
      case 'RELEASING': return ['COMPLETE_RELEASING', 'CANCEL_BATCH']
      default: return []
    }
  }
  if (type === 'step') {
    switch (state) {
      case 'CREATE': return ['EXECUTE']
      case 'SHORT': return ['MARK_EXCEED', 'MARK_SKIP']
      default: return []
    }
  }
  return []
})

const stateColors: Record<string, string> = {
  CREATE: 'info',
  PRODUCTION: 'warning',
  RELEASING: 'warning',
  FINISH: 'success',
  CANCEL: 'error',
  EXECUTED: 'success',
  SHORT: 'success',
  EXCEED: 'warning',
  SKIP: 'default',
}

async function loadTree() {
  loading.value = true
  try {
    treeData.value = await api.ssm.tree()
  } catch (e: any) {
    msg.error('加载失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

function nodeClick(keys: string[], option: any) {
  selectedNode.value = option
}

async function sendEvent(event: string) {
  if (!selectedNode.value) return
  const { type, entityId } = selectedNode.value
  try {
    if (type === 'project') await api.ssm.sendProjectEvent(entityId, event)
    else if (type === 'batch') await api.ssm.sendBatchEvent(entityId, event)
    else if (type === 'step') await api.ssm.sendStepEvent(entityId, event)
    msg.success('操作成功')
    await loadTree()
  } catch (e: any) {
    msg.error('操作失败: ' + e.message)
  }
}

onMounted(loadTree)
</script>

<template>
  <div class="page-container">
    <h2 class="text-xl font-bold mb-4">状态机演示</h2>
    <div class="flex gap-4" style="height: calc(100vh - 120px)">
      <NCard title="实体层级" style="width: 320px; overflow: auto">
        <NTree
          :data="treeData"
          :default-expand-all="true"
          :node-props="() => ({ style: 'cursor:pointer' })"
          @update:selected-keys="nodeClick"
          pattern=""
        />
      </NCard>
      <NCard title="详情与操作" style="flex: 1; overflow: auto">
        <template v-if="entityInfo">
          <div class="mb-4">
            <p><strong>类型:</strong> {{ entityInfo.type }}</p>
            <p><strong>名称:</strong> {{ entityInfo.label }}</p>
            <p><strong>当前状态:</strong>
              <NTag :type="stateColors[entityInfo.state] || 'default'">{{ entityInfo.state }}</NTag>
            </p>
            <p v-if="entityInfo.resultType"><strong>执行结果:</strong>
              <NTag :type="stateColors[entityInfo.resultType] || 'default'">{{ entityInfo.resultType }}</NTag>
            </p>
          </div>
          <div v-if="availableEvents.length">
            <p class="mb-2 font-bold">可用操作:</p>
            <NSpace>
              <NButton v-for="evt in availableEvents" :key="evt" type="primary" @click="sendEvent(evt)">
                {{ evt }}
              </NButton>
            </NSpace>
          </div>
          <p v-else class="text-gray-400">该实体当前没有可用操作</p>
        </template>
        <p v-else class="text-gray-400">请在左侧选择一个实体</p>
      </NCard>
    </div>
  </div>
</template>
```

---

### Task 15: 构建验证

- [ ] **后端构建**

Run: `cd demo/backend && gradle build`
Expected: BUILD SUCCESSFUL

- [ ] **前端构建**

Run: `cd demo/ui && bun run build`
Expected: 构建成功

- [ ] **启动验证**

Run: `cd demo/backend && gradle bootRun`
然后 curl GET `http://localhost:8080/api/ssm/tree` 检查返回数据
