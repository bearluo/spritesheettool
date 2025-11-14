# 项目结构分析报告

## 项目概览

**项目名称**: spritesheettool  
**项目类型**: Vue 3 + Vite + TypeScript Web 应用  
**当前状态**: 开发中 - Cocos Creator 插件集成进行中 
**项目路径**: E:\\bearluo\\spritesheettool

## 项目结构

### 根目录结构
`
spritesheettool/
├── .cursor/              # Cursor IDE 配置
├── .github/              # GitHub 工作流配置
├── .vscode/              # VSCode 配置
├── dist/                 # 构建输出目录
├── memory-bank/          # 任务管理目录
├── node_modules/         # 依赖包目录
├── public/               # 静态资源目录
├── scripts/              # 脚本目录（CLI 接口扩展）
├── src/                  # 源代码目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── README.md             # 项目说明
`

### src 目录结构

`
src/
├── assets/               # 静态资源
├── components/           # Vue 组件
│   ├── common/           # 通用组件
│   ├── packOptions/      # 打包选项组件
│   ├── ConfigEditor.vue  # 配置编辑器
│   ├── ImageList.vue     # 图片列表
│   ├── ImageUploader.vue # 图片上传
│   ├── SplitSpritePreview.vue # 分割预览
│   └── SpritePreview.vue # 精灵图预览
├── composables/          # 组合式函数
│   ├── useImageProcessor.ts # 图片处理
│   ├── useSpritePacker.ts   # 精灵图打包
│   └── useSpriteUnpacker.ts # 精灵图解包
├── parsers/              # 解析器模块
│   ├── IParser.ts        # 解析器接口定义
│   ├── JsonParser.ts     # JSON 解析器
│   ├── PlistParser.ts    # PLIST 解析器
│   ├── ParserRegistry.ts # 解析器注册表
│   └── parserUtils.ts    # 解析工具方法
├── router/               # 路由配置
│   └── index.ts          # 路由定义
├── stores/               # Pinia 状态管理
│   ├── imageStore.ts     # 图片状态
│   └── spriteStore.ts    # 精灵图状态
├── types/                # TypeScript 类型定义
│   ├── image.ts          # 图片类型
│   └── sprite.ts         # 精灵图类型
├── utils/                # 工具函数
│   ├── configParser.ts   # 配置解析
│   ├── fileUtils.ts      # 文件工具
│   ├── imageUtils.ts     # 图片工具
│   └── packAlgorithms.ts # 打包算法
├── views/                # 页面视图
│   ├── PackView.vue      # 打包视图
│   ├── SplitView.vue     # 分割视图
│   └── UnpackView.vue    # 解包视图
├── App.vue               # 根组件
└── main.ts               # 应用入口
`

### scripts 目录结构

`
scripts/
└── cocos-pack.ts         # Cocos Creator 打包 CLI
`

### memory-bank 目录结构

`
memory-bank/
├── activeContext.md              # 当前上下文
├── Cocos-Creator-Extension-Guide.md # 扩展开发指南
├── productContext.md             # 产品上下文
├── progress.md                   # 进度记录
├── projectbrief.md               # 项目简介
├── style-guide.md                # 风格指南
├── systemPatterns.md             # 系统模式
├── tasks.md                      # 任务清单
└── techContext.md                # 技术上下文
`

## 项目功能模块

### 1. 核心功能模块

#### 打包功能 (PackView.vue)
- 图片上传与管理
- 打包配置选项
- 精灵图预览
- 导出 PNG + JSON/PLIST 配置

#### 分割功能 (SplitView.vue)
- 图片上传
- 行列数设置
- 分割预览
- 批量导出 ZIP

#### 解包功能 (UnpackView.vue)
- 精灵图上传
- 配置文件上传（JSON/PLIST）
- 分割预览
- 批量下载

### 2. 核心工具模块

#### 图片处理 (useImageProcessor.ts)
- 支持图片上传与读入
- 图片信息提取
- 图片分割处理

#### 精灵图打包 (useSpritePacker.ts)
- 调用打包算法
- 生成 Canvas 精灵图
- 生成配置数据

#### 精灵图解包 (useSpriteUnpacker.ts)
- 读取配置文件
- 从图集中提取子图
- 批量下载处理

### 3. 解析器模块
#### 解析器接口 (IParser.ts)
- 统一的解析器接口定义

#### JSON 解析器 (JsonParser.ts)
- 解析 JSON 格式配置

#### PLIST 解析器 (PlistParser.ts)
- 解析 PLIST 格式配置（约350行，代码复用）

#### 解析器注册表 (ParserRegistry.ts)
- 解析器注册与管理
- 自动识别文件格式

### 4. 打包算法模块

#### 打包算法 (packAlgorithms.ts)
- Bin Packing 算法
- Max Rect 算法
- 布局优化

### 5. CLI 接口扩展
#### Cocos 打包 CLI (cocos-pack.ts)
- 命令行参数解析
- 文件读写与处理
- 调用打包流程（待完善）

## 技术栈

### 前端框架
- **Vue 3**: 组合式API
- **TypeScript**: 类型安全
- **Element Plus**: UI 组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理

### 构建工具
- **Vite**: 构建工具
- **vue-tsc**: TypeScript 类型检查
- **tsx**: TypeScript 运行器（CLI）

### 重要依赖
- **maxrects-packer**: 矩形打包算法
- **jszip**: ZIP 文件处理
- **fast-xml-parser**: XML/PLIST 解析
- **canvas API**: 图像处理

## 项目进度
### 已完成
- [x] 项目初始化
- [x] 核心功能实现（打包、解包、分割）
- [x] 解析器模块（JSON、PLIST）
- [x] 打包算法实现
- [x] 任务规划（PLAN 模式）
- [x] 架构设计（CREATIVE 模式）
- [x] Cocos Creator 项目创建
- [x] CLI 接口基础雏形
- [x] 扩展开发指南文档

### 进行中
- [ ] Cocos Creator 扩展开发
- [ ] CLI 接口完善
- [ ] 打包流程兼容 Node.js 环境

### 待完成
- [ ] 技术验证（VAN QA）
- [ ] 扩展界面 UI 实现
- [ ] 扩展 CLI 打包集成测试
- [ ] 文档完善

## 代码统计

### 文件数量
- **Vue 组件**: 12 个
- **TypeScript 模块**: 20+ 个
- **总代码行数**: 约50,000+ 行（含 node_modules）

### 主要文件
- **PlistParser.ts**: 9350 行（最大文件）
- **PackView.vue**: 6286 行
- **UnpackView.vue**: 6543 行
- **SplitView.vue**: 5765 行
- **packAlgorithms.ts**: 5563 行

## 技术难点

1. **浏览器/Node API 兼容**: 现有打包流程使用浏览器 Canvas API，需适配至 Node.js 环境
2. **CLI 接口完善**: 需补全打包流程的 Node.js 版本
3. **扩展界面**: 需完全实现插件 UI
4. **路径处理**: 需保证 Windows 路径正确处理
5. **资源同步**: 需实现 Cocos Creator 资源刷新机制

## 下一步计划
1. **完善 CLI 接口**: 适配打包流程至 Node.js 环境
2. **实现扩展界面**: 使用 Vue 3 + Element Plus 构建插件界面
3. **技术验证**: 在 Cocos Creator 中测试各项功能
4. **文档完善**: 更新、使用最新文档和 API
5. **测试**: 补充单元测试与集成测试

## 参考资料
- Cocos Creator 3.8 扩展开发文档：https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/
- Cocos Creator 插件开发最佳实践：https://forum.cocos.org/t/topic/163959
- 项目任务清单：memory-bank/tasks.md
- 扩展开发指南：memory-bank/Cocos-Creator-Extension-Guide.md
