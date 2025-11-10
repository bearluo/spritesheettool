# 合图拆图工具

一个基于 Vue3 + TypeScript 的合图拆图工具，支持将多个图片合并成一张合图，以及从合图中拆分出原始图片。

## 功能特性

- 🖼️ **合图功能**：将多个图片合并成一张合图，自动排列
- ✂️ **拆图功能**：从合图中拆分出原始图片
- 📋 **配置导出**：生成 JSON 配置文件，记录每个子图的位置和尺寸
- 🎨 **实时预览**：实时预览合图效果
- 📦 **批量下载**：支持批量下载拆分后的图片

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Element Plus
- Pinia
- Canvas API

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 组件
├── composables/     # 组合式函数
├── stores/          # 状态管理
├── utils/           # 工具函数
├── types/           # 类型定义
├── App.vue          # 根组件
└── main.ts          # 入口文件
```

## License

MIT

