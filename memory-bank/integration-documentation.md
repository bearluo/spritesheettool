# Sprite Sheet Tool 集成文档

## 1. 项目概述

### 1.1 项目目标

将现有基于 Vue 3 + Vite 的 Sprite Sheet Tool（图片打包与拆包）功能集成到 Cocos Creator 3.8.7，实现其在 Cocos Creator 编辑器工作流中的使用。

### 1.2 功能需求

- **打包功能**：将多张图片打包成雪碧图
- **拆包功能**：从雪碧图中拆分出单独图片
- **逆向拆分功能**：根据配置文件和图片还原原始图片
- **格式支持**：支持 JSON、PLIST 配置文件格式
- **Cocos Creator 集成**：与 Cocos 资源系统集成，支持资源刷新

### 1.3 技术栈

- **主项目**：Vue 3 + Vite + TypeScript + Element Plus
- **Cocos Creator**：3.8.7
- **扩展技术**：Vue 3 + Vite + Element Plus + Cocos Creator 扩展 API
- **构建工具**：Vite + TypeScript

## 2. 架构设计

### 2.1 总体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Cocos Creator 扩展                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              扩展面板 (浏览器环境)                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │ PackView │  │UnpackView│  │SplitView │        │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │  │
│  │       │             │             │               │  │
│  │  ┌────┴───────────────────────────┴─────┐        │  │
│  │  │      核心逻辑 (共用模块)              │        │  │
│  │  │  - useSpritePacker.ts                │        │  │
│  │  │  - useSpriteUnpacker.ts              │        │  │
│  │  │  - packAlgorithms.ts                 │        │  │
│  │  │  - imageUtils.ts                     │        │  │
│  │  └────┬──────────────────────────────────┘        │  │
│  └───────┼───────────────────────────────────────────┘  │
│          │                                               │
│  ┌───────┴───────────────────────────────────────────┐  │
│  │            Cocos Creator API 桥接模块              │  │
│  │  - Editor.Message.request()                        │  │
│  │  - Editor.Message.send()                           │  │
│  │  - Editor.Utils.Path                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 模块划分

#### 2.2.1 扩展面板模块（浏览器环境）

- **PackPanel.vue**：打包功能面板
- **UnpackPanel.vue**：拆包功能面板
- **SplitPanel.vue**：逆向拆分功能面板
- **App.vue**：主应用组件

#### 2.2.2 核心逻辑模块（共用）

- **useSpritePacker.ts**：打包逻辑
- **useSpriteUnpacker.ts**：拆包逻辑
- **packAlgorithms.ts**：打包算法（maxRects、simple）
- **imageUtils.ts**：图片处理工具方法
- **parsers/**：配置文件解析器（JSON、PLIST）

#### 2.2.3 Cocos Creator API 桥接模块

- **cocosApi.ts**：Cocos Creator API 封装
- **fileOperations.ts**：文件操作封装
- **assetManager.ts**：资源管理封装

## 3. 技术选型

### 3.1 Canvas API

**选择**：浏览器原生 Canvas API

**原因**：
- Cocos Creator 扩展面板运行于浏览器环境
- 无需额外原生模块依赖
- 与主项目代码高度兼容
- 性能满足需求

### 3.2 文件系统操作

**选择**：Cocos Creator 编辑器 API

**原因**：
- 通过 Editor.Message.request() 读取项目资源
- 通过 Editor.Message.send() 写入资源
- 通过 Editor.Message.request() 刷新资源数据库
- 自动处理 .meta 文件

### 3.3 路径处理

**选择**：Cocos Creator Editor.Utils.Path

**原因**：
- 跨平台自动处理路径分隔符
- 与 Cocos 项目路径格式兼容
- 提供路径标准化功能

## 4. 实现步骤

### 4.1 阶段一：环境准备

#### 4.1.1 检查扩展项目结构

```bash
cd sprite-sheet-tool
npm install
npm run build
```

#### 4.1.2 验证扩展项目构建是否成功

```bash
npm run build
```

### 4.2 阶段二：核心逻辑抽离

#### 4.2.1 创建共用模块目录结构

```
sprite-sheet-tool/src/
├── core/
│   ├── packer.ts          # 打包逻辑
│   ├── unpacker.ts        # 拆包逻辑
│   ├── algorithms.ts      # 打包算法
│   ├── imageUtils.ts      # 图片处理工具
│   └── parsers/           # 解析器
│       ├── json.ts
│       └── plist.ts
```

#### 4.2.2 拷贝主项目核心逻辑

- 拷贝 `src/composables/useSpritePacker.ts` 至扩展项目
- 拷贝 `src/composables/useSpriteUnpacker.ts` 至扩展项目
- 拷贝 `src/utils/packAlgorithms.ts` 至扩展项目
- 拷贝 `src/utils/imageUtils.ts` 至扩展项目
- 拷贝 `src/parsers/` 至扩展项目

#### 4.2.3 适配扩展项目环境

- 移除 Vue 相关依赖（如 `ref`, `computed` 等）
- 保持核心逻辑不变
- 补充类型定义

### 4.3 阶段三：Cocos Creator API 集成

#### 4.3.1 创建 Cocos Creator API 封装

```typescript
// src/core/cocosApi.ts
export class CocosApi {
  /**
   * 读取项目资源
   */
  static async readAsset(path: string): Promise<ArrayBuffer> {
    // 调用 Editor.Message.request() 读取资源
    const result = await Editor.Message.request('asset-db', 'query-asset', {
      uuid: assetUuid
    })
    return result.data
  }

  /**
   * 写入资源到项目
   */
  static async writeAsset(path: string, data: ArrayBuffer): Promise<void> {
    // 调用 Editor.Message.send() 写入资源
    await Editor.Message.send('asset-db', 'create-asset', {
      parentUuid: parentUuid,
      type: 'cc.Texture2D',
      name: 'sprite.png',
      content: data
    })
  }

  /**
   * 刷新资源数据库
   */
  static async refreshAssetDatabase(): Promise<void> {
    // 调用 Editor.Message.request() 刷新资源数据库
    await Editor.Message.request('asset-db', 'refresh-asset', {
      uuid: assetUuid
    })
  }

  /**
   * 获取项目路径
   */
  static async getProjectPath(): Promise<string> {
    // 调用 Editor.Message.request() 获取项目路径
    return await Editor.Message.request('project', 'get-project-path')
  }
}
```

#### 4.3.2 实现文件操作封装

```typescript
// src/core/fileOperations.ts
import { CocosApi } from './cocosApi'

export class FileOperations {
  /**
   * 读取图片文件
   */
  static async readImage(path: string): Promise<ImageData> {
    const data = await CocosApi.readAsset(path)
    return new ImageData(data)
  }

  /**
   * 写入图片文件
   */
  static async writeImage(path: string, data: ImageData): Promise<void> {
    await CocosApi.writeAsset(path, data.buffer)
  }

  /**
   * 读取配置文件
   */
  static async readConfig(path: string): Promise<string> {
    const data = await CocosApi.readAsset(path)
    return new TextDecoder().decode(data)
  }

  /**
   * 写入配置文件
   */
  static async writeConfig(path: string, content: string): Promise<void> {
    const data = new TextEncoder().encode(content)
    await CocosApi.writeAsset(path, data.buffer)
  }
}
```

### 4.4 阶段四：扩展面板 UI 开发

#### 4.4.1 创建打包面板组件

```vue
<!-- src/panels/components/PackPanel.vue -->
<template>
  <div class="pack-panel">
    <el-card>
      <template #header>
        <span>打包功能</span>
      </template>
      <!-- 图片上传区域 -->
      <ImageUploader @change="handleImagesChange" />
      <!-- 打包选项 -->
      <PackOptions v-model="options" />
      <!-- 打包预览 -->
      <SpritePreview v-if="result" :result="result" />
      <!-- 操作按钮 -->
      <el-button @click="handlePack">开始打包</el-button>
      <el-button @click="handleExport">导出</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpritePacker } from '@/core/packer'
import { CocosApi } from '@/core/cocosApi'
import ImageUploader from './ImageUploader.vue'
import PackOptions from './PackOptions.vue'
import SpritePreview from './SpritePreview.vue'

const packer = useSpritePacker()
const images = ref([])
const options = ref({})
const result = ref(null)

function handleImagesChange(newImages: any[]) {
  images.value = newImages
}

async function handlePack() {
  try {
    const packResult = await packer.packSprites(images.value, options.value)
    result.value = packResult
    // 保存到 Cocos Creator 项目
    await CocosApi.writeAsset('assets/sprites/sprite.png', packResult.canvas)
    await CocosApi.writeAsset('assets/sprites/sprite.json', packResult.config)
    // 刷新资源数据库
    await CocosApi.refreshAssetDatabase()
  } catch (error) {
    console.error('打包失败:', error)
  }
}

function handleExport() {
  // 导出逻辑
}
</script>
```

#### 4.4.2 创建拆包面板组件

```vue
<!-- src/panels/components/UnpackPanel.vue -->
<template>
  <div class="unpack-panel">
    <el-card>
      <template #header>
        <span>拆包功能</span>
      </template>
      <!-- 图片及配置文件上传 -->
      <FileUploader @change="handleFilesChange" />
      <!-- 拆包预览 -->
      <SplitSpritePreview v-if="result" :result="result" />
      <!-- 操作按钮 -->
      <el-button @click="handleUnpack">开始拆包</el-button>
      <el-button @click="handleExport">导出</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpriteUnpacker } from '@/core/unpacker'
import { CocosApi } from '@/core/cocosApi'
import FileUploader from './FileUploader.vue'
import SplitSpritePreview from './SplitSpritePreview.vue'

const unpacker = useSpriteUnpacker()
const imagePath = ref('')
const configPath = ref('')
const result = ref(null)

function handleFilesChange(files: any) {
  imagePath.value = files.image
  configPath.value = files.config
}

async function handleUnpack() {
  try {
    // 读取图片与配置文件
    const imageData = await CocosApi.readAsset(imagePath.value)
    const configData = await CocosApi.readAsset(configPath.value)
    // 拆包
    const unpackResult = await unpacker.unpackSprites(imageData, configData)
    result.value = unpackResult
    // 保存到 Cocos Creator 项目
    for (const blob of unpackResult) {
      await CocosApi.writeAsset(`assets/sprites/${blob.name}`, blob.data)
    }
    // 刷新资源数据库
    await CocosApi.refreshAssetDatabase()
  } catch (error) {
    console.error('拆包失败:', error)
  }
}

function handleExport() {
  // 导出逻辑
}
</script>
```

#### 4.4.3 更新主应用组件

```vue
<!-- src/panels/App.vue -->
<template>
  <div class="app">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="打包" name="pack">
        <PackPanel />
      </el-tab-pane>
      <el-tab-pane label="拆包" name="unpack">
        <UnpackPanel />
      </el-tab-pane>
      <el-tab-pane label="逆向分割" name="split">
        <SplitPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PackPanel from './components/PackPanel.vue'
import UnpackPanel from './components/UnpackPanel.vue'
import SplitPanel from './components/SplitPanel.vue'

const activeTab = ref('pack')
</script>
```

### 4.5 阶段五：功能集成

#### 4.5.1 集成打包功能

打包功能集成见 PackPanel 组件示例。

#### 4.5.2 集成拆包功能

拆包功能集成见 UnpackPanel 组件示例。

### 4.6 阶段六：异常处理与日志

#### 4.6.1 添加异常处理

```typescript
// src/core/errorHandler.ts
export class ErrorHandler {
  static handle(error: Error, context: string) {
    console.error(`[${context}]`, error)
    // 在 Cocos Creator 面板显示错误
    Editor.Message.send('panel', 'show-error', {
      message: error.message,
      context
    })
  }

  static showError(message: string) {
    Editor.Message.send('panel', 'show-error', {
      message
    })
  }

  static showSuccess(message: string) {
    Editor.Message.send('panel', 'show-success', {
      message
    })
  }
}
```

#### 4.6.2 添加日志

```typescript
// src/core/logger.ts
export class Logger {
  static info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args)
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args)
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args)
  }

  static debug(message: string, ...args: any[]) {
    console.debug(`[DEBUG] ${message}`, ...args)
  }
}
```

## 5. 代码结构

### 5.1 扩展项目目录结构

```
sprite-sheet-tool/
├── src/
│   ├── browser/
│   │   └── index.ts                # 扩展入口
│   ├── panels/
│   │   ├── App.vue                 # 主应用组件
│   │   ├── panel.ts                # 面板入口
│   │   ├── components/
│   │   │   ├── PackPanel.vue       # 打包面板
│   │   │   ├── UnpackPanel.vue     # 拆包面板
│   │   │   ├── SplitPanel.vue      # 逆向分割面板
│   │   │   ├── ImageUploader.vue   # 图片上传组件
│   │   │   ├── ImageList.vue       # 图片列表组件
│   │   │   ├── SpritePreview.vue   # 打包预览组件
│   │   │   └── PackOptions.vue     # 打包选项组件
│   │   └── style.css               # 样式文件
│   ├── core/
│   │   ├── packer.ts               # 打包逻辑
│   │   ├── unpacker.ts             # 拆包逻辑
│   │   ├── algorithms.ts           # 打包算法
│   │   ├── imageUtils.ts           # 图片处理工具
│   │   ├── cocosApi.ts             # Cocos API 封装
│   │   ├── fileOperations.ts       # 文件操作封装
│   │   ├── errorHandler.ts         # 异常处理
│   │   ├── logger.ts               # 日志
│   │   └── parsers/
│   │       ├── json.ts             # JSON 解析器
│   │       └── plist.ts            # PLIST 解析器
│   └── types/
│       ├── image.ts                # 图片类型定义
│       ├── sprite.ts               # 雪碧图类型定义
│       └── cocos.ts                # Cocos 类型定义
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 5.2 主项目目录结构（参考）

```
src/
├── composables/
│   ├── useSpritePacker.ts          # 打包逻辑
│   └── useSpriteUnpacker.ts        # 拆包逻辑
├── utils/
│   ├── packAlgorithms.ts           # 打包算法
│   └── imageUtils.ts               # 图片处理工具
├── parsers/
│   ├── JsonParser.ts               # JSON 解析器
│   └── PlistParser.ts              # PLIST 解析器
└── types/
    ├── image.ts                    # 图片类型定义
    └── sprite.ts                   # 雪碧图类型定义
```

## 6. API 集成说明

### 6.1 Cocos Creator 编辑器 API

#### 6.1.1 读取资源

```typescript
// 读取资源文件
const result = await Editor.Message.request('asset-db', 'query-asset', {
  uuid: assetUuid
})
```

#### 6.1.2 写入资源

```typescript
// 写入资源文件
await Editor.Message.send('asset-db', 'create-asset', {
  parentUuid: parentUuid,
  type: 'cc.Texture2D',
  name: 'sprite.png',
  content: imageData
})
```

#### 6.1.3 刷新资源数据库

```typescript
// 刷新资源数据库
await Editor.Message.request('asset-db', 'refresh-asset', {
  uuid: assetUuid
})
```

#### 6.1.4 获取项目路径

```typescript
// 获取项目路径
const projectPath = await Editor.Message.request('project', 'get-project-path')
```

### 6.2 路径处理

```typescript
// 使用 Cocos Creator 路径工具
const assetPath = Editor.Utils.Path.join(projectPath, 'assets', 'sprites', 'sprite.png')
const normalizedPath = Editor.Utils.Path.normalize(assetPath)
```

## 7. 测试计划

### 7.1 单元测试

- 测试打包逻辑
- 测试拆包逻辑
- 测试打包算法
- 测试配置文件解析器

### 7.2 集成测试

- 测试 Cocos API 集成
- 测试文件操作
- 测试资源刷新

### 7.3 功能测试

- 测试打包功能
- 测试拆包功能
- 测试逆向拆分功能
- 测试异常处理

## 8. 文档

### 8.1 用户文档

- 扩展安装指引
- 功能使用说明
- 常见问题解答

### 8.2 开发者文档

- 代码结构说明
- API 文档
- 扩展开发指南

### 8.3 变更日志

- 版本更新记录
- 功能变更说明
- 已知问题

## 9. 备注

### 9.1 环境兼容性

- Cocos Creator 3.8.7
- Node.js 18+
- Windows 10+

### 9.2 性能优化

- 大图处理优化
- 内存管理
- 异步处理

### 9.3 异常处理

- 完善的错误消息
- 日志记录
- 用户友好的错误提示

### 9.4 安全

- 路径校验
- 资源访问权限控制
- 数据有效性检查

## 10. 实现时间表

### 10.1 阶段一（1-2天）

- 环境准备
- 核心逻辑抽离
- 基本结构搭建

### 10.2 阶段二（2-3天）

- 接入 Cocos Creator API
- 文件操作封装
- 基本功能实现

### 10.3 阶段三（2-3天）

- 扩展面板 UI 开发
- 功能集成
- 异常处理

### 10.4 阶段四（1-2天）

- 测试与调试
- 文档编写
- 发布准备

**合计：6-10天**

## 11. 风险评估

### 11.1 技术风险

- **风险**：Cocos Creator API 变更
- **应对**：使用稳定 API，确保版本兼容

### 11.2 性能风险

- **风险**：大图处理性能问题
- **应对**：优化算法，采用异步处理

### 11.3 兼容性风险

- **风险**：兼容不同 Cocos 版本问题
- **应对**：多版本测试，实现版本适配检测

## 12. 未来优化方向

### 12.1 功能拓展

- 支持更多图片格式
- 支持更多配置文件格式
- 支持批量处理

### 12.2 性能优化

- 大图处理使用 Web Worker
- 打包算法优化
- 增加缓存机制

### 12.3 用户体验

- 进度展示
- 预览功能
- 撤销/重做功能

## 13. 参考资料

- Cocos Creator 3.8 扩展开发文档
- Vue 3 官方文档
- Element Plus 文档
- TypeScript 官方文档

## 14. 实施检查清单

### 阶段一：环境准备
- [ ] 检查扩展项目结构
- [ ] 验证扩展能否正常构建
- [ ] 安装依赖
- [ ] 配置构建工具

### 阶段二：核心逻辑抽离
- [ ] 创建共用模块目录结构
- [ ] 拷贝主项目核心逻辑
- [ ] 适配扩展环境
- [ ] 添加类型定义

### 阶段三：Cocos Creator API 集成
- [ ] 创建 Cocos API 封装
- [ ] 实现文件操作封装
- [ ] 测试 API 集成
- [ ] 处理错误

### 阶段四：扩展面板 UI 开发
- [ ] 创建 PackPanel 组件
- [ ] 创建 UnpackPanel 组件
- [ ] 创建 SplitPanel 组件
- [ ] 更新主应用组件
- [ ] 补充样式

### 阶段五：功能集成
- [ ] 集成打包功能
- [ ] 集成拆包功能
- [ ] 集成逆向拆分功能
- [ ] 测试全部功能

### 阶段六：异常处理与日志
- [ ] 添加异常处理
- [ ] 添加日志
- [ ] 测试异常场景
- [ ] 增强用户反馈

### 阶段七：测试与文档
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 编写功能测试
- [ ] 编写用户文档
- [ ] 编写开发者文档

## 15. 关键实现要点

### 15.1 核心逻辑适配

主项目核心逻辑需要适配到扩展环境：

1. **移除 Vue 依赖**：如 `ref`、`computed` 等
2. **保留核心算法**：原打包/拆包算法逻辑不变
3. **补全类型定义**：增加 TypeScript 类型声明
4. **处理异步操作**：确保异步流程无阻塞

### 15.2 Cocos Creator API 规范使用

文件操作需通过 Cocos 官方 API：

1. **读取资源**：`Editor.Message.request()` 读取资源
2. **写入资源**：`Editor.Message.send()` 写入项目资源
3. **刷新资源**：`Editor.Message.request()` 刷新数据库
4. **路径处理**：`Editor.Utils.Path` 进行路径操作

### 15.3 异常处理策略

合理错误处理保证用户体验：

1. **try-catch 捕获**：关键流程全面 try-catch
2. **日志记录**：详细日志方便排查问题
3. **UI 反馈**：友好错误提示
4. **边界情况处理**：如空文件、格式错误等

### 15.4 性能考虑

面对大图处理时需注意：

1. **异步处理**：所有文件操作 async/await
2. **进度反馈**：长操作提供进度提示
3. **内存管理**：及时释放无用图片数据
4. **算法效率**：采用高效打包算法

## 16. 下一步

1. **启动实现**：从环境准备开始
2. **核心模块搭建**：先实现共用核心逻辑
3. **API 集成**：完成与 Cocos API 的对接
4. **UI 开发**：开发扩展面板各界面
5. **全面测试**：全部功能流程测试修正
6. **完善文档**：用户、开发文档编写

## 17. 结语

本集成说明文档为 Sprite Sheet Tool 集成 Cocos Creator 提供了详细说明及执行路线。根据本指南推进，预计 6-10 天可高质量完成全部集成工作。

项目成功的关键：
- 充分的前期规划与架构设计
- 细致的核心逻辑适配
- 规范的 Cocos API 对接
- 完善的测试与异常处理
- 明晰的开发及用户文档

祝集成顺利！

