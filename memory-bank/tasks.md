# Task: 将现有 SpriteSheet Tool 集成到 Cocos Creator

## Description
- 使当前基于 Vue/Vite 的图集工具可以在 Cocos Creator 工作流中使用
- 支持在 Cocos Creator 内调用打包及拆分功能，并与项目资源目录联动
- 需要保证导入导出格式与 Cocos Creator 兼容，并能集成其构建流程

## Complexity
- Level: 3
- Type: Intermediate Feature / 中阶集成

## Technology Stack
- 前端: Vue 3 + Vite + TypeScript + Element Plus
- 游戏引擎: Cocos Creator 3.x (桌面)
- 脚本: TypeScript（Cocos Creator 脚本环境）
- 工具链: Node.js 18+、pnpm/npm、Cocos Creator CLI 工具

## Technology Validation Checkpoints
- [ ] 验证 Cocos Creator CLI / Editor 可通过命令行启动并导入项目
- [ ] 验证 Node.js 与 Cocos Creator 同时运行的环境配合
- [ ] 建立最小示例：在 Cocos Creator 中调用外部打包脚本
- [ ] 验证资源输出目录读写权限与路径配置（Windows 路径分隔符等）
- [ ] 执行一次构建测试，确保不影响原有 Vue 应用运行

## Status
- [x] Initialization complete
- [x] Planning complete
- [ ] Technology validation complete
- [x] Cocos Creator 项目创建完成（sprite-sheet-tool-test）
- [x] 扩展目录结构创建完成
- [x] CLI 原型面板基础原型创建完成
- [ ] Implementation in progress
- [ ] Documentation / Archive complete

## Requirements Breakdown
- R1：在 Cocos Creator 编辑器中集成当前工具的打包功能（UI 或自定义面板）
- R2：支持从 Cocos 项目资源目录读取/写入图片与配置文件
- R3：保证可独立运行的 Web 应用
- R4：统一配置格式，支持 JSON/PLIST 与 Cocos Creator 兼容
- R5：集成后打包 & 拆分流程使用说明

## Affected Components
- src/views/PackView.vue
- src/views/UnpackView.vue
- src/composables/useSpritePacker.ts
- src/composables/useSpriteUnpacker.ts
- src/utils/configParser.ts
- 新增：Cocos Creator 扩展/自定义面板代码（外部目录）

## Implementation Plan
1. **架构设计与接口定义**
   - 分析 Cocos Creator 扩展机制（Editor Extension / Custom Panel）
   - 确定 Vue 工具通信方式（命令行脚本、HTTP 服务、文件监听等）
   - 输出集成接口文档
2. **搭建 Cocos Creator 示例项目**
   - 使用 Cocos Creator 新建空白项目并导入依赖（cocos-project/）
   - 配置资源目录与测试素材
   - 验证项目可编辑运行
3. **实现资源工具面板**
   - 编写 Node/TS 脚本，用于在 Cocos 内调用现有打包逻辑
   - 调整工具输出路径，支持 Cocos Assets/ 下 meta 文件处理
   - 提供命令行接口（如 pnpm cocos:pack）
4. **Cocos Creator 内部 UI/命令集成**
   - 在 Cocos 内创建自定义扩展面板，调用集成脚本
   - 提供基础 UI：资源选择、触发打包/拆分、日志查看
   - 处理执行结果与错误提示
5. **同步配置与文档更新**
   - 在 configParser 增加 Cocos 相关配置适配
   - 编写使用指南与 README 更新
   - 补充测试用例（含集成测试）

## Creative Phases Required
- [x] Integration Architecture（已完成，详见 memory-bank/creative/creative-cocos-integration.md）
- [ ] UI/UX（Cocos 扩展面板界面）
- [ ] Data Model（如需调整配置结构）

## Dependencies
- Cocos Creator 3.x 安装包及 CLI 工具
- Node.js 18+ / npm 或 pnpm
- JSZip / 文件系统访问（已集成）
- 可能新增：chokidar（如用文件监听）、express（如用本地服务）

## Challenges & Mitigations
- **环境兼容**：Cocos Creator 在 Windows 下的路径与权限特殊，建议使用路径适配工具，测试管理员/普通用户模式
- **通信方式选择**：内嵌脚本 vs 外部服务，优先选择对 Cocos 影响最小且易于维护的方案
- **资源同步**：确保打包生成的 meta 文件与资源一致，调整 Cocos meta 生成规则，必要时调用 Editor API 更新
- **跨项目同步**：Vue 工具与 Cocos 项目需同步更新，注意脚本与文档同步说明

## Notes
- 方案完成后需基于 Creative Phase 输出架构文档（已完成）
- 需确认团队是否已安装 Cocos Creator 及其版本和路径

## Reference Documentation
- Cocos Creator 3.8 扩展开发：https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/
- Cocos Creator 3.8 API 文档：https://docs.cocos.com/creator/3.8/api/zh/
- 扩展开发模板：https://store.cocos.com/app/detail/3037
