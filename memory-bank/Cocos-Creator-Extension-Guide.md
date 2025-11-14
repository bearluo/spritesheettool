# Cocos Creator 3.8.7 扩展开发指北
> 参考文档：[Cocos Creator 插件开发最佳实践](https://forum.cocos.org/t/topic/163959)

## 概述

本指北基于 Cocos Creator 3.8.7 官方文档和社区最佳实践，介绍如何使用现代前端工程化工具链（Vite + Vue 3）开发 Cocos Creator 扩展。

## 推荐模式

使用 Vite + Vue 3 开发 Cocos Creator 扩展的优势：

1. 现代前端工程化：支持组件化开发、热重载、TypeScript 等。
2. 更好的开发体验：接近现代前端开发标准，AI 编码友好。
3. 代码复用：可复用 Vue 组件库（如 Element Plus）。
4. 构建优化：Vite 提供快速的构建与开发体验。

## 项目结构

```
sprite-sheet-tool/
├── src/
│   ├── browser.ts          # 扩展入口文件（Node.js 环境）
│   └── panel/              # 面板代码（浏览器环境）
│       ├── index.html      # 面板 HTML 入口
│       ├── index.ts        # 面板主入口
│       ├── App.vue         # Vue 主组件
│       └── components/     # Vue 组件
├── dist/                   # 构建输出目录
│   ├── browser.cjs         # 扩展入口（Node.js）
│   └── panel.cjs           # 面板代码（浏览器）
├── package.json            # 扩展配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── tsconfig.app.json       # 应用 TypeScript 配置
```

## 安装依赖

### 核心依赖

- vue: ^3.4.37
- element-plus: ^2.8.6
- @cocos-fe/vite-plugin-cocos-panel: ^1.0.3
- @cocos/creator-types: ^3.8.6
- vite: ^5.4.1
- typescript: ^5.8.2

### 安装命令

```bash
cd extensions/sprite-sheet-tool
npm install
```

## 配置文件说明

### 1. package.json

主要配置项：
- main: 指向 ./dist/browser.cjs（扩展入口）
- panels.default.main: 指向 ./dist/panel.cjs（面板脚本）
- scripts.build: 使用 vue-tsc -b && vite build 进行构建

### 2. vite.config.ts

使用 @cocos-fe/vite-plugin-cocos-panel 插件：
- 配置面板名称和入口文件
- 使用库模式构建 browser.cjs
- 自动引入 Element Plus 组件

### 3. TypeScript 配置

- tsconfig.json: 工程通用配置
- tsconfig.app.json: 应用代码配置
- tsconfig.node.json: Node.js 环境配置

## 代码结构

### 1. 扩展入口 (src/browser.ts)

Node.js 环境，处理扩展初始化与消息处理等。

### 2. 面板入口 (src/panel/index.html)

HTML 入口文件，加载 Vue 应用。

### 3. 面板主入口 (src/panel/index.ts)

创建 Vue 应用，挂载到 DOM。

### 4. Vue 组件 (src/panel/App.vue)

使用 Element Plus 构建 UI。

## 构建与开发

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

## 在 Cocos Creator 中使用

1. 安装依赖：npm install
2. 构建扩展：npm run build
3. 重新加载扩展：在 Cocos Creator 中点击 扩展 > 重新加载扩展
4. 打开面板：点击菜单 扩展 > sprite-sheet-tool > 精灵图工具

## 最佳实践

1. 代码组织：区分 Node.js 环境与浏览器环境代码
2. 类型定义：通过 @cocos/creator-types 获取类型支持
3. 资源路径：使用 Editor.Utils.Path 处理路径
4. 消息通信：通过 Editor.Message 进行扩展间通信

## 参考资源

- Cocos Creator 3.8 扩展开发文档：https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/
- Cocos Creator 插件开发最佳实践：https://forum.cocos.org/t/topic/163959
- Vite 官网：https://vitejs.dev/
- Vue 3 官网：https://vuejs.org/
- Element Plus 官网：https://element-plus.org/

## 总结

使用 Vite + Vue 3 开发 Cocos Creator 扩展带来了现代前端开发体验，让扩展开发更高效和现代化。