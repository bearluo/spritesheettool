# 🎨 CREATIVE PHASE: Integration Architecture

## Problem Statement
- 目标：让现有基于 Vue/Vite 的精灵图 Web 工具�?Cocos Creator 工作流内被触发与复用
- 场景：关卡设计师或美术在 Cocos 编辑器中直接操作资源，期望零切换执行打包/拆分
- 约束�?  - 当前 Web 项目需保持独立运行能力
  - 需兼容 Windows 环境下的路径与权�?  - Cocos Creator 3.x 插件体系�?TypeScript/Node 实现，运行在编辑器进程中

## System Requirements
- R1：可�?Cocos 编辑�?UI 中触发打�?拆分命令
- R2：读�?Cocos 项目 ssets/ 目录，并处理 .meta 文件保持资源 GUID
- R3：支�?JSON/PLIST 配置导入导出，与现有工具兼容
- R4：原 Web 工具继续支持独立模式，无额外构建耦合
- R5：集成方案可被脚本化，支�?CLI/CI 执行

## Component Analysis
- Cocos Editor Extension：扩展侧 UI，负责触发操作、选择资源、展示日�?- Bridge CLI (Node)：进程桥梁，复用现有 useSpritePacker / useSpriteUnpacker 逻辑并适配输出路径
- Vue Tool Core Modules：`pack、`unpack、`configParser 等业务逻辑，通过 Node 接口调用
- Asset Pipeline：Cocos ssets/ 文件系统�?.meta 同步

### Interaction Overview
`mermaid
sequenceDiagram
    participant Panel as Cocos Extension Panel
    participant Bridge as Node Bridge CLI
    participant Core as Sprite Tool Core
    participant FS as Cocos Assets FS

    Panel->>Bridge: pack --input=assets/sprites --out=assets/output
    Bridge->>Core: packSprites(images, options)
    Core->>FS: 写入 atlas.png + atlas.json
    Core->>Bridge: 返回配置与日�?    Bridge-->>Panel: 输出执行结果
    Panel-->>Panel: 调用 Editor API 刷新资源�?`

## Architecture Options
### Option A：嵌�?WebView 加载现有 Vue 应用
- 描述：在 Cocos Editor 面板中嵌入浏览器视图，直接访问构建后�?Web 工具，通过 postMessage 与编辑器通信
- 优点：UI 完全复用，交互一�?- 缺点：文件访问需通过自定义桥接，通信层复杂；WebView 在不同版本兼容性欠�?- 技术契合：中｜复杂度：高｜可扩展性：�?
### Option B：自定义扩展面板 + 外部 Node CLI（候选）
- 描述：扩展面板提供轻�?UI，通过 child_process 调用独立 Node CLI，CLI 内复用既有打包逻辑
- 优点：架构清晰，CLI 可独立在命令�?CI 使用；核心逻辑复用；UI 只保留关键操�?- 缺点：需要提�?CLI 接口并设计日�?状态回�?- 技术契合：高｜复杂度：中｜可扩展性：�?
### Option C：共享库方式直接在扩展内引入业务模块
- 描述：将 useSpritePacker 等核心逻辑提取�?npm 包，Cocos 扩展直接 import
- 优点：运行同进程，通信成本最�?- 缺点：需大量拆分工作以剥离前端依赖；版本同步与发布流程复�?- 技术契合：低｜复杂度：高｜可扩展性：�?
## Decision
- **选定方案：Option B（自定义扩展面板 + Node CLI 桥接�?*
- 选择理由�?  - 与既有项目结构兼容度最高，可快速复用核心逻辑
  - CLI 具备独立运行能力，满足独立工具与 CI 场景需�?  - Windows 环境下落地风险较低，易于控制权限与日�?  - 可分阶段演进 UI，先实现命令式触发，再逐步增强交互

## Implementation Considerations
- CLI 封装：在 scripts/ 下新�?cocos-pack.ts、`cocos-unpack.ts，统一参数与输�?- 路径处理：桥接层使用 path.win32 / path.posix 规避分隔符差�?- .meta 同步：执行完毕调�?Editor.Message.send('asset-db', 'refresh-asset', targetDir)
- 错误处理：CLI 捕获异常并返回结构化错误给面板展�?- 配置兼容：保�?JSON/PLIST 命名规则，与 Web 模式共享实现

## Validation Checklist
- [ ] CLI 可在命令行独立运行指定输入输出路�?- [ ] Cocos 面板成功调用 CLI 并生成图�?拆分文件
- [ ] .meta 文件保留或重新生成后刷新无异�?- [ ] 集成后仍可单独构建并运行�?Web 工具
- [ ] 日志与错误信息在面板中可�?
## Component Diagram
`mermaid
graph TD
    subgraph Cocos Editor
        Panel[Extension Panel]
        IPC[Child Process Bridge]
    end
    subgraph Node CLI
        CLI[cocos-pack CLI]
        Core[Sprite Tool Core]
    end
    subgraph Project Assets
        Src[assets/ sprites]
        Out[assets/ atlas]
    end

    Panel --> IPC
    IPC --> CLI
    CLI --> Core
    Core --> Src
    Core --> Out
    Panel -->|refresh| Out
`

## Plan Alignment
1. 架构设计：已明确采用 Option B，CLI/面板职责划分完成
2. 示例项目：Cocos 项目将包含扩展与测试资源，验证桥接流�?3. 资源桥接：CLI 负责 IO，写入后触发资源刷新
4. UI 集成：面板提供参数输入、任务状态、日志展�?5. 文档：在 README 与使用指南中补充调用步骤与参数说�?
## Risks & Mitigations
- 权限风险：提醒在具备写权限的项目目录执行，必要时提示以管理员运行
- 长时任务体验：预留进�?日志回传接口，避免界面卡�?- 依赖同步：在 package.json 中共用核心依赖，避免双重安装

## Decision Summary
- 产出：新�?scripts/cocos-pack.ts、`scripts/cocos-unpack.ts �?cocos-extension/ 面板工程
- 下一步：构建 CLI 原型并搭建面�?skeleton，进�?VAN QA/实现前的技术验�?
🎨🎨🎨 EXITING CREATIVE PHASE - DECISION MADE 🎨🎨🎨
