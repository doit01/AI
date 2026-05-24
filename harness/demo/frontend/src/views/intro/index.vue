<script setup lang="ts">
import { ref } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'

const tabValue = ref('harness')
</script>

<template>
  <div class="intro">
    <h1>Harness 项目</h1>
    <p class="subtitle">全栈 Spring Boot 4 + Vue 3 演示项目 — JPA 关联关系实战 + 多智能体编排 (OMO)</p>

    <NTabs v-model:value="tabValue" type="line" animated>
      <NTabPane name="harness" tab="Harness 工程">
        <section>
          <h2>Superpowers</h2>
          <p>obra 出品的高分插件（186k stars），注入软件工程最佳实践（TDD、YAGNI、代码审查、重构、头脑风暴等 50+ 技能），强制 AI 按工程师标准思考。</p>
          <p>插件源：<code>superpowers@git+https://github.com/obra/superpowers.git</code></p>
          <p>安装方式：全局 + 项目 <code>opencode.jsonc</code> 的 <code>plugins</code> 数组已添加，重启 opencode 后自动拉取注册。</p>
          <p>验证：启动后问 <em>"Do you have superpowers?"</em></p>
          <table>
            <tr><th>常用技能</th><th>说明</th></tr>
            <tr><td>superpowers/brainstorming</td><td>方案头脑风暴</td></tr>
            <tr><td>superpowers/tdd</td><td>测试驱动开发流程</td></tr>
            <tr><td>superpowers/code-review</td><td>代码审查</td></tr>
            <tr><td>superpowers/refactoring</td><td>安全重构</td></tr>
            <tr><td>superpowers/debugging</td><td>结构化调试</td></tr>
            <tr><td>superpowers/planning</td><td>技术方案规划</td></tr>
          </table>
        </section>

        <section>
          <h2>OMO 多智能体</h2>
          <p>Oh My OpenAgent，用 <code>ultrawork</code> / <code>ulw</code> 触发：</p>
          <pre>opencode run "ultrawork 帮我实现用户导出功能"</pre>
          <p>全局插件：<code>C:\Users\86152\.config\opencode\plugins\</code>（oh-my-openagent@latest）</p>
          <p>OMO 配置：<code>C:\Users\86152\.config\opencode\oh-my-openagent.json</code></p>
          <table>
            <tr><th>智能体</th><th>职责</th></tr>
            <tr><td>Sisyphus</td><td>编排/协调</td></tr>
            <tr><td>Oracle</td><td>架构决策 / 高 IQ 推理</td></tr>
            <tr><td>Hephaestus</td><td>深度编码实现</td></tr>
            <tr><td>Librarian</td><td>文档 / 研究查找</td></tr>
            <tr><td>Prometheus</td><td>项目规划</td></tr>
            <tr><td>Atlas</td><td>大规模重构</td></tr>
          </table>
        </section>

        <section>
          <h2>Token 优化工具</h2>

          <div class="card">
            <div class="card-title">RTK (Rust Token Killer)</div>
            <p>CLI 输出压缩代理，自动拦截 bash 命令输出并压缩，减少 <strong>60-90%</strong> token 消耗。</p>
            <p>二进制：<code>C:\Users\86152\AppData\Local\rtk\rtk.exe</code></p>
            <p>插件：<code>C:\Users\86152\.config\opencode\plugins\rtk.ts</code>（自动加载）</p>
          </div>

          <div class="card">
            <div class="card-title">DCP (Dynamic Context Pruning)</div>
            <p>动态上下文裁剪，自动识别并移除对话历史中过时的工具输出，用高保真摘要替换。</p>
            <p>npm 包：<code>@tarquinen/opencode-dcp@latest</code>（全局 + 项目 plugins 中注册）</p>
          </div>
        </section>

        <section>
          <h2>Skills（57 项）</h2>
          <p>全部位于 <code>C:\Users\86152\.claude\skills\</code>：</p>

          <div class="card">
            <div class="card-title">始终可用（项目相关）</div>
            <table>
              <tr><th>技能</th><th>路径</th></tr>
              <tr><td>springboot-patterns</td><td>C:\Users\86152\.claude\skills\springboot-patterns\SKILL.md</td></tr>
              <tr><td>java-coding-standards</td><td>C:\Users\86152\.claude\skills\java-coding-standards\SKILL.md</td></tr>
              <tr><td>coding-standards</td><td>C:\Users\86152\.claude\skills\coding-standards\SKILL.md</td></tr>
              <tr><td>frontend-patterns</td><td>C:\Users\86152\.claude\skills\frontend-patterns\SKILL.md</td></tr>
              <tr><td>api-design</td><td>C:\Users\86152\.claude\skills\api-design\SKILL.md</td></tr>
              <tr><td>backend-patterns</td><td>C:\Users\86152\.claude\skills\backend-patterns\SKILL.md</td></tr>
            </table>
          </div>

          <div class="card">
            <div class="card-title">按需触发</div>
            <table>
              <tr><th>技能</th><th>路径</th></tr>
              <tr><td>springboot-tdd</td><td>C:\Users\86152\.claude\skills\springboot-tdd\SKILL.md</td></tr>
              <tr><td>e2e-testing</td><td>C:\Users\86152\.claude\skills\e2e-testing\SKILL.md</td></tr>
              <tr><td>tdd-workflow</td><td>C:\Users\86152\.claude\skills\tdd-workflow\SKILL.md</td></tr>
              <tr><td>springboot-verification</td><td>C:\Users\86152\.claude\skills\springboot-verification\SKILL.md</td></tr>
              <tr><td>verification-loop</td><td>C:\Users\86152\.claude\skills\verification-loop\SKILL.md</td></tr>
              <tr><td>frontend-design</td><td>C:\Users\86152\.claude\skills\frontend-design\SKILL.md</td></tr>
              <tr><td>council</td><td>C:\Users\86152\.claude\skills\council\SKILL.md</td></tr>
              <tr><td>mcp-server-patterns</td><td>C:\Users\86152\.claude\skills\mcp-server-patterns\SKILL.md</td></tr>
              <tr><td>customize-opencode</td><td>C:\Users\86152\.claude\skills\customize-opencode\SKILL.md</td></tr>
              <tr><td>configure-ecc</td><td>C:\Users\86152\.claude\skills\configure-ecc\SKILL.md</td></tr>
              <tr><td>code-tour</td><td>C:\Users\86152\.claude\skills\code-tour\SKILL.md</td></tr>
              <tr><td>hookify-rules</td><td>C:\Users\86152\.claude\skills\hookify-rules\SKILL.md</td></tr>
            </table>
          </div>

          <details>
            <summary style="cursor:pointer;color:#a78bfa;font-weight:600">展开全部 57 项技能</summary>
            <table>
              <tr><th>技能</th><th>路径</th></tr>
              <tr><td>agent-introspection-debugging</td><td>C:\Users\86152\.claude\skills\agent-introspection-debugging\SKILL.md</td></tr>
              <tr><td>agent-sort</td><td>C:\Users\86152\.claude\skills\agent-sort\SKILL.md</td></tr>
              <tr><td>ai-regression-testing</td><td>C:\Users\86152\.claude\skills\ai-regression-testing\SKILL.md</td></tr>
              <tr><td>android-clean-architecture</td><td>C:\Users\86152\.claude\skills\android-clean-architecture\SKILL.md</td></tr>
              <tr><td>code-tour</td><td>C:\Users\86152\.claude\skills\code-tour\SKILL.md</td></tr>
              <tr><td>compose-multiplatform-patterns</td><td>C:\Users\86152\.claude\skills\compose-multiplatform-patterns\SKILL.md</td></tr>
              <tr><td>configure-ecc</td><td>C:\Users\86152\.claude\skills\configure-ecc\SKILL.md</td></tr>
              <tr><td>continuous-learning</td><td>C:\Users\86152\.claude\skills\continuous-learning\SKILL.md</td></tr>
              <tr><td>continuous-learning-v2</td><td>C:\Users\86152\.claude\skills\continuous-learning-v2\SKILL.md</td></tr>
              <tr><td>cpp-coding-standards</td><td>C:\Users\86152\.claude\skills\cpp-coding-standards\SKILL.md</td></tr>
              <tr><td>cpp-testing</td><td>C:\Users\86152\.claude\skills\cpp-testing\SKILL.md</td></tr>
              <tr><td>csharp-testing</td><td>C:\Users\86152\.claude\skills\csharp-testing\SKILL.md</td></tr>
              <tr><td>dart-flutter-patterns</td><td>C:\Users\86152\.claude\skills\dart-flutter-patterns\SKILL.md</td></tr>
              <tr><td>django-patterns</td><td>C:\Users\86152\.claude\skills\django-patterns\SKILL.md</td></tr>
              <tr><td>django-tdd</td><td>C:\Users\86152\.claude\skills\django-tdd\SKILL.md</td></tr>
              <tr><td>django-verification</td><td>C:\Users\86152\.claude\skills\django-verification\SKILL.md</td></tr>
              <tr><td>dotnet-patterns</td><td>C:\Users\86152\.claude\skills\dotnet-patterns\SKILL.md</td></tr>
              <tr><td>eval-harness</td><td>C:\Users\86152\.claude\skills\eval-harness\SKILL.md</td></tr>
              <tr><td>everything-claude-code-conventions</td><td>C:\Users\86152\.claude\skills\everything-claude-code\SKILL.md</td></tr>
              <tr><td>frontend-slides</td><td>C:\Users\86152\.claude\skills\frontend-slides\SKILL.md</td></tr>
              <tr><td>golang-patterns</td><td>C:\Users\86152\.claude\skills\golang-patterns\SKILL.md</td></tr>
              <tr><td>golang-testing</td><td>C:\Users\86152\.claude\skills\golang-testing\SKILL.md</td></tr>
              <tr><td>hookify-rules</td><td>C:\Users\86152\.claude\skills\hookify-rules\SKILL.md</td></tr>
              <tr><td>iterative-retrieval</td><td>C:\Users\86152\.claude\skills\iterative-retrieval\SKILL.md</td></tr>
              <tr><td>kotlin-coroutines-flows</td><td>C:\Users\86152\.claude\skills\kotlin-coroutines-flows\SKILL.md</td></tr>
              <tr><td>kotlin-exposed-patterns</td><td>C:\Users\86152\.claude\skills\kotlin-exposed-patterns\SKILL.md</td></tr>
              <tr><td>kotlin-ktor-patterns</td><td>C:\Users\86152\.claude\skills\kotlin-ktor-patterns\SKILL.md</td></tr>
              <tr><td>kotlin-patterns</td><td>C:\Users\86152\.claude\skills\kotlin-patterns\SKILL.md</td></tr>
              <tr><td>kotlin-testing</td><td>C:\Users\86152\.claude\skills\kotlin-testing\SKILL.md</td></tr>
              <tr><td>laravel-patterns</td><td>C:\Users\86152\.claude\skills\laravel-patterns\SKILL.md</td></tr>
              <tr><td>laravel-plugin-discovery</td><td>C:\Users\86152\.claude\skills\laravel-plugin-discovery\SKILL.md</td></tr>
              <tr><td>laravel-tdd</td><td>C:\Users\86152\.claude\skills\laravel-tdd\SKILL.md</td></tr>
              <tr><td>laravel-verification</td><td>C:\Users\86152\.claude\skills\laravel-verification\SKILL.md</td></tr>
              <tr><td>nestjs-patterns</td><td>C:\Users\86152\.claude\skills\nestjs-patterns\SKILL.md</td></tr>
              <tr><td>perl-patterns</td><td>C:\Users\86152\.claude\skills\perl-patterns\SKILL.md</td></tr>
              <tr><td>perl-testing</td><td>C:\Users\86152\.claude\skills\perl-testing\SKILL.md</td></tr>
              <tr><td>plankton-code-quality</td><td>C:\Users\86152\.claude\skills\plankton-code-quality\SKILL.md</td></tr>
              <tr><td>python-patterns</td><td>C:\Users\86152\.claude\skills\python-patterns\SKILL.md</td></tr>
              <tr><td>python-testing</td><td>C:\Users\86152\.claude\skills\python-testing\SKILL.md</td></tr>
              <tr><td>rust-patterns</td><td>C:\Users\86152\.claude\skills\rust-patterns\SKILL.md</td></tr>
              <tr><td>rust-testing</td><td>C:\Users\86152\.claude\skills\rust-testing\SKILL.md</td></tr>
              <tr><td>skill-stocktake</td><td>C:\Users\86152\.claude\skills\skill-stocktake\SKILL.md</td></tr>
              <tr><td>strategic-compact</td><td>C:\Users\86152\.claude\skills\strategic-compact\SKILL.md</td></tr>
            </table>
          </details>
        </section>

        <section>
          <h2>MCP 服务器</h2>
          <p>注册于 <code>harness/opencode.jsonc</code> 的 <code>mcp</code> 字段：</p>
          <table>
            <tr><th>名称</th><th>命令</th><th>用途</th></tr>
            <tr><td>postgres</td><td><code>npx -y @modelcontextprotocol/server-postgres</code></td><td>数据库查询</td></tr>
            <tr><td>context7</td><td><code>npx -y @upstash/context7-mcp@latest</code></td><td>实时框架文档</td></tr>
            <tr><td>playwright</td><td><code>npx -y @playwright/mcp --browser chrome</code></td><td>浏览器自动化</td></tr>
            <tr><td>filesystem</td><td><code>npx -y @modelcontextprotocol/server-filesystem .</code></td><td>文件系统访问</td></tr>
            <tr><td>github</td><td><code>npx -y @modelcontextprotocol/server-github</code></td><td>GitHub PR/Issues</td></tr>
          </table>
        </section>

        <section>
          <h2>opencode 命令</h2>
          <p>注册于 <code>harness/opencode.jsonc</code> 的 <code>commands</code> 字段：</p>
          <table>
            <tr><th>命令</th><th>说明</th></tr>
            <tr><td><code>opencode run dev</code></td><td>启动全部开发环境</td></tr>
            <tr><td><code>opencode run backend:run</code></td><td>运行后端</td></tr>
            <tr><td><code>opencode run frontend:dev</code></td><td>启动前端 dev server</td></tr>
            <tr><td><code>opencode run frontend:build</code></td><td>构建前端</td></tr>
            <tr><td><code>opencode run backend:build</code></td><td>构建后端</td></tr>
            <tr><td><code>opencode run docker:build</code></td><td>Jib 构建 Docker 镜像</td></tr>
            <tr><td><code>opencode run test</code></td><td>运行后端测试</td></tr>
            <tr><td><code>ultrawork/ulw &lt;任务&gt;</code></td><td>OMO 多智能体编排</td></tr>
            <tr><td><code>@oracle &lt;问题&gt;</code></td><td>OMO 架构/决策分析</td></tr>
            <tr><td><code>@librarian &lt;问题&gt;</code></td><td>OMO 研究/资料查找</td></tr>
          </table>
        </section>

        <section>
          <h2>项目 Agents</h2>
          <p>定义于 <code>harness/opencode.jsonc</code>：</p>
          <table>
            <tr><th>Agent</th><th>技能</th></tr>
            <tr><td>backend-dev</td><td>springboot-patterns, springboot-tdd, java-coding-standards, jpa-patterns</td></tr>
            <tr><td>frontend-dev</td><td>frontend-patterns, coding-standards</td></tr>
            <tr><td>fullstack-dev</td><td>springboot-patterns, springboot-tdd, java-coding-standards, frontend-patterns, e2e-testing</td></tr>
          </table>
        </section>

        <section>
          <h2>配置文件</h2>
          <table>
            <tr><th>文件</th><th>作用</th></tr>
            <tr><td>opencode.jsonc</td><td>项目级 opencode 配置（plugins/agents/commands/MCP）</td></tr>
            <tr><td>CLAUDE.md</td><td>用户技术偏好 &amp; 使用指引（自动加载）</td></tr>
            <tr><td>application.yml</td><td>数据库连接配置</td></tr>
            <tr><td>.opencode/permissions.jsonc</td><td>允许的命令/域名白名单</td></tr>
            <tr><td>.opencode/hooks.jsonc</td><td>工具调用钩子配置</td></tr>
          </table>
        </section>

        <section>
          <h2>开发约定</h2>
          <ul>
            <li>JDK 25 + Spring Boot 4.0.5，Gradle 构建</li>
            <li>PostgreSQL 18 原生运行，用户 86152，无密码</li>
            <li>DDL 自动更新：<code>spring.jpa.hibernate.ddl-auto=update</code></li>
            <li>Aliyun Maven 镜像加速</li>
            <li>Windows PowerShell 环境</li>
            <li>代码风格：不用注释 / 不用 emoji（除非要求）</li>
          </ul>
        </section>
      </NTabPane>

      <NTabPane name="demo" tab="Demo 项目">
        <section>
          <h2>项目概览</h2>
          <div class="grid">
            <div class="grid-item"><div class="label">后端</div><strong>Spring Boot 4.0.5</strong></div>
            <div class="grid-item"><div class="label">语言</div><strong>JDK 25</strong></div>
            <div class="grid-item"><div class="label">前端</div><strong>Vue 3 + NaiveUI</strong></div>
            <div class="grid-item"><div class="label">构建</div><strong>Gradle + Bun</strong></div>
            <div class="grid-item"><div class="label">数据库</div><strong>PostgreSQL 18</strong></div>
            <div class="grid-item"><div class="label">代码简化</div><strong>Lombok</strong></div>
          </div>
        </section>

        <section>
          <h2>项目结构</h2>
          <pre>harness/
├── demo/
│   ├── backend/               # 后端（按领域分包）
│   │   └── src/main/java/com/demo/
│   │       ├── common/        # BaseEntity
│   │       ├── config/        # CorsConfig, DataInitializer
│   │       ├── department/    # DTO + Controller + Service + Repository + Entity
│   │       ├── user/
│   │       ├── role/
│   │       ├── menu/
│   │       └── manytomany/    # Student ↔ Course
│   └── frontend/              # Vue 3 + NaiveUI + UnoCSS
│       └── src/views/
│           ├── department/    # 部门树 + 人员表格
│           ├── user/          # 用户 CRUD
│           ├── role/          # 角色 CRUD
│           ├── menu/          # 菜单树
│           └── manytomany/    # 学生 ↔ 课程 选课管理
├── opencode.jsonc             # opencode 命令/智能体/MCP
├── CLAUDE.md                  # 技术偏好 & 使用指引
└── docs/                      # 介绍页</pre>
        </section>

        <section>
          <h2>JPA 关联关系总览</h2>
          <table>
            <tr><th>关系</th><th>实体</th><th>说明</th></tr>
            <tr><td>@OneToMany 自引用</td><td>Department → Department</td><td>部门树（parent/children）</td></tr>
            <tr><td>@ManyToOne</td><td>User → Department</td><td>用户所属部门</td></tr>
            <tr><td>@ManyToMany</td><td>User ↔ Role</td><td>用户-角色（sys_user_role）</td></tr>
            <tr><td>@ManyToMany</td><td>Role ↔ Menu</td><td>角色-菜单（sys_role_menu）</td></tr>
            <tr><td>@OneToMany 自引用</td><td>Menu → Menu</td><td>菜单树（parent/children）</td></tr>
            <tr><td>@ManyToMany</td><td>Student ↔ Course</td><td>学生选课（mm_student_course）</td></tr>
          </table>
        </section>

        <section>
          <h2>后端技术要点</h2>

          <div class="card">
            <div class="card-title">按领域分包</div>
            <p>每个领域一个包，包含完整 CRUD 闭环：</p>
            <pre>com.demo/department/
├── Department.java         (Entity)
├── DepartmentRepository.java
├── DepartmentService.java
├── DepartmentController.java
└── DepartmentDto.java      (record)</pre>
          </div>

          <div class="card">
            <div class="card-title">DTO 使用 record</div>
            <p>所有 DTO 转为 Java <code>record</code>，不可变、自带 equals/hashCode/toString。配合 <code>@Builder</code> 和 <code>@Valid</code>：</p>
            <pre>@Builder
public record UserDto(
    Long id,
    @NotBlank String username,
    @Email String email,
    ...
) {}</pre>
          </div>

          <div class="card">
            <div class="card-title">关联集合用 Set 而非 List</div>
            <p>所有 <code>@OneToMany</code> 和 <code>@ManyToMany</code> 使用 <code>Set&lt;Entity&gt;</code> + <code>LinkedHashSet</code>，避免 Hibernate Bag 语义问题：</p>
            <pre>@OneToMany(mappedBy = "parent")
@OrderBy("sort ASC")
private Set&lt;Department&gt; children = new LinkedHashSet&lt;&gt;();</pre>
          </div>

          <div class="card">
            <div class="card-title">BaseEntity 抽象基类</div>
            <p>公共 <code>id</code>、<code>createdAt</code>、<code>@PrePersist</code> 提取到 <code>@MappedSuperclass</code>：</p>
            <pre>@Getter @Setter
@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}</pre>
          </div>

          <div class="card">
            <div class="card-title">数据初始化</div>
            <p>首次启动自动插入 5 部门 + 4 用户 + 2 角色 + 5 菜单 + 3 课程 + 2 学生，检测到有数据跳过。</p>
          </div>

          <div class="card">
            <div class="card-title">双向关联同步</div>
            <p>创建 User 时同步维护 <code>dept.getUsers().add(u)</code>，保持双方一致性。</p>
          </div>
        </section>

        <section>
          <h2>前端技术要点</h2>

          <div class="card">
            <div class="card-title">深色主题</div>
            <p>NaiveUI <code>darkTheme</code> 全局深色 + UnoCSS <code>dark:</code> 变体。</p>
          </div>

          <div class="card">
            <div class="card-title">左侧导航</div>
            <p><code>NLayout</code> + <code>NLayoutSider</code> + <code>NMenu</code> 构建侧边栏。</p>
          </div>
        </section>

        <section>
          <h2>页面功能</h2>
          <table>
            <tr><th>页面</th><th>路由</th><th>功能</th></tr>
            <tr><td>部门人员管理</td><td>/departments</td><td>左侧部门树 + 右侧人员表格（含角色 Tag）</td></tr>
            <tr><td>用户管理</td><td>/users</td><td>用户列表 CRUD</td></tr>
            <tr><td>角色管理</td><td>/roles</td><td>角色列表 CRUD</td></tr>
            <tr><td>菜单管理</td><td>/menus</td><td>菜单树 CRUD</td></tr>
            <tr><td>学生选课</td><td>/manytomany</td><td>3 个 Tab：学生 / 课程 / 选课</td></tr>
          </table>
        </section>

        <section>
          <h2>启动方式</h2>
          <pre># 一键启动
opencode run dev

# 或分别启动
cd demo/backend  && gradle bootRun          # http://localhost:8080
cd demo/frontend && bun run dev             # http://localhost:3000</pre>
        </section>

        <section>
          <h2>API 接口</h2>
          <table>
            <tr><th>前缀</th><th>方法</th></tr>
            <tr><td>/api/departments</td><td>GET, POST, PUT, DELETE</td></tr>
            <tr><td>/api/users</td><td>GET, POST, PUT, DELETE</td></tr>
            <tr><td>/api/roles</td><td>GET, POST, PUT, DELETE</td></tr>
            <tr><td>/api/menus</td><td>GET, POST, PUT, DELETE</td></tr>
            <tr><td>/api/manytomany/students</td><td>GET, POST, PUT, DELETE</td></tr>
            <tr><td>/api/manytomany/courses</td><td>GET, POST, PUT, DELETE</td></tr>
          </table>
        </section>
      </NTabPane>

      <NTabPane name="ecc" tab="ECC 安装">
        <section>
          <h2>Everything Claude Code (ECC)</h2>
          <p>跨平台内容包 — 156+ skills、72+ commands、38 agents。由 <a href="https://github.com/affaan-m/everything-claude-code" style="color:#a78bfa">affaan-m/everything-claude-code</a> 维护，189k stars。</p>
        </section>

        <section>
          <h2>方式一：全局 CLI（官方推荐）</h2>
          <pre>npx claudepluginhub affaan-m/everything-claude-code --plugin everything-claude-code</pre>
          <p>ECC 会装到 <code>~/.claude/</code>，所有项目共享。这是官方 README 和 marketplace 上的标准安装命令。</p>
        </section>

        <section>
          <h2>方式二：项目级 npm 插件</h2>
          <pre>npm install -D ecc-universal</pre>
          <p>在 <code>opencode.jsonc</code> 中注册：</p>
          <pre>{
  "plugins": {
    "ecc-universal": {}
  }
}</pre>
          <p>每个项目独立版本控制、团队环境一致、避免跨项目互相影响。</p>
        </section>

        <section>
          <h2>方式三：混合模式（v1.9.0+）</h2>
          <pre>npx claudepluginhub affaan-m/everything-claude-code --plugin everything-claude-code \<br>  --with lang:typescript --with agent:security-reviewer \<br>  --without skill:continuous-learning</pre>
          <p>选择性安装，只装需要的组件。</p>
        </section>

        <section>
          <h2>版本检查</h2>
          <pre># npm 插件版本
npm view ecc-universal version

# 当前本地安装版本（全局路径）
Get-Content ~/.claude/install-state.json | ConvertFrom-Json | Select-Object -ExpandProperty version</pre>
        </section>

        <section>
          <h2>当前状态</h2>
          <p>本机已全局安装 <strong>ECC v1.10.0</strong>（2026-04-05 发布，最新稳定版）。</p>
          <p>如需迁移到项目级安装，执行 <code>npm install -D ecc-universal</code> 并注册到 <code>opencode.jsonc</code> 的 <code>plugins</code> 字段即可。</p>
        </section>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped>
.intro {
  max-width: 900px; margin: 0 auto; padding: 32px 24px;
  color: #e0e0e0; line-height: 1.7;
}
h1 { font-size: 1.8em; color: #7c3aed; margin-bottom: 8px; }
.subtitle { color: #94a3b8; margin-bottom: 28px; font-size: 0.95em; }
h2 { font-size: 1.2em; color: #a78bfa; margin: 24px 0 10px; border-bottom: 1px solid #334155; padding-bottom: 6px; }
p, li { color: #cbd5e1; }
ul { padding-left: 20px; }
li { margin: 4px 0; }
code {
  background: #0f172a; color: #e2e8f0; padding: 2px 6px; border-radius: 4px;
  font-size: 0.9em; font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
pre {
  background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px;
  overflow-x: auto; font-size: 0.85em; line-height: 1.5; margin: 12px 0;
  border: 1px solid #1e293b;
}
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin: 12px 0; }
.grid-item {
  background: #0f172a; border: 1px solid #1e293b; border-radius: 8px;
  padding: 10px 14px; text-align: center;
}
.grid-item .label { font-size: 0.8em; color: #94a3b8; }
.card {
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  padding: 16px; margin: 12px 0;
}
.card-title { font-weight: 600; margin-bottom: 8px; color: #e2e8f0; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9em; }
th, td { text-align: left; padding: 6px 12px; border-bottom: 1px solid #1e293b; }
th { color: #a78bfa; font-weight: 600; background: #0f172a; }
section { margin-bottom: 16px; }
:deep(.n-tabs-nav) { margin-bottom: 8px; }
:deep(.n-tabs-nav .n-tabs-tab) { color: #94a3b8; }
:deep(.n-tabs-nav .n-tabs-tab--active) { color: #a78bfa; }
</style>
