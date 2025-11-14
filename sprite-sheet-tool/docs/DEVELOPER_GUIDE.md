# Sprite Sheet Tool - 开发者指南

## 目录

1. [项目结构](#项目结构)
2. [代码架构](#代码架构)
3. [API 文档](#api-文档)
4. [扩展开发](#扩展开发)
5. [贡献指南](#贡献指南)

## 项目结构

```
sprite-sheet-tool/
├── src/
│   ├── browser/          # 主进程代码
│   │   └── index.ts      # 主进程入口
│   ├── core/             # 核心逻辑
│   │   ├── algorithms.ts # 打包算法
│   │   ├── cocosApi.ts   # Cocos Creator API
│   │   ├── errorHandler.ts # 错误处理
│   │   ├── fileOperations.ts # 文件操作
│   │   ├── imageUtils.ts # 图片处理工具
│   │   ├── logger.ts     # 日志模块
│   │   ├── packer.ts     # 打包逻辑
│   │   ├── unpacker.ts   # 拆包逻辑
│   │   └── parsers/      # 配置文件解析器
│   ├── panels/           # 面板代码
│   │   ├── components/   # 组件
│   │   ├── views/        # 视图
│   │   ├── composables/  # Composables
│   │   ├── App.vue       # 主面板
│   │   └── panel.ts      # 面板入口
│   └── types/            # 类型定义
├── dist/                 # 构建输出
├── package.json          # 扩展配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 代码架构

### 核心模块

#### CocosApi

Cocos Creator API 封装类，提供与 Cocos Creator 编辑器交互的接口。

```typescript
import { CocosApi } from './core'

// 获取项目路径
const projectPath = await CocosApi.getProjectPath()

// 读取资源
const data = await CocosApi.readAssetByPath('assets/image.png')

// 写入资源
await CocosApi.writeAsset('assets/image.png', arrayBuffer)

// 刷新资源数据库
await CocosApi.refreshAssetDatabase()
```

#### FileOperations

文件操作封装类，提供文件读写接口。

```typescript
import { FileOperations } from './core'

// 读取图片
const image = await FileOperations.readImage('assets/image.png')

// 写入图片
await FileOperations.writeImage('assets/image.png', canvas)

// 写入配置文件
await FileOperations.writeConfig('assets/config.json', jsonString)
```

#### Packer

打包逻辑，提供合图打包功能。

```typescript
import { packSprites } from './core'

const result = await packSprites(images, {
  algorithm: 'bin-packing',
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  allowRotation: true
})
```

#### Unpacker

拆包逻辑，提供合图拆包功能。

```typescript
import { unpackSprites } from './core'

const results = await unpackSprites(imageUrl, config)
```

#### ErrorHandler

错误处理模块，提供统一的错误处理接口。

```typescript
import { ErrorHandler, ErrorType } from './core'

try {
  // 操作
} catch (error) {
  const errorMessage = ErrorHandler.getErrorMessage(error)
  ErrorHandler.handleError(error, 'context')
  throw ErrorHandler.createError(ErrorType.FILE_READ_ERROR, errorMessage, error)
}
```

#### Logger

日志模块，提供统一的日志记录接口。

```typescript
import { Logger, LogLevel } from './core'

Logger.debug('调试信息')
Logger.info('信息')
Logger.warn('警告')
Logger.error('错误')

// 记录函数执行时间
await Logger.logExecution(async () => {
  // 操作
}, '操作名称')
```

### 面板模块

#### PackPanel

打包面板，提供合图打包功能。

#### UnpackPanel

拆包面板，提供合图拆包功能。

#### SplitPanel

拆分面板，提供图片拆分功能。

#### useImageProcessor

图片处理 Composable，提供图片管理功能。

```typescript
import { useImageProcessor } from './composables/useImageProcessor'

const { images, addImages, removeImage, clearImages, splitImage } = useImageProcessor()
```

## API 文档

### CocosApi

#### getProjectPath(): Promise<string>

获取项目路径。

#### readAssetByPath(assetPath: string): Promise<ArrayBuffer>

读取资源文件。

#### writeAsset(assetPath: string, data: ArrayBuffer): Promise<void>

写入资源文件。

#### refreshAssetDatabase(assetPath?: string): Promise<void>

刷新资源数据库。

### FileOperations

#### readImage(assetPath: string): Promise<ArrayBuffer>

读取图片文件。

#### writeImage(assetPath: string, canvas: HTMLCanvasElement): Promise<void>

写入图片文件。

#### writeConfig(assetPath: string, content: string): Promise<void>

写入配置文件。

### Packer

#### packSprites(images: ImageInfo[], options?: SpritePackerOptions): Promise<SpritePackerResult>

打包合图。

### Unpacker

#### unpackSprites(spriteImageUrl: string, config: SpriteSheetConfig): Promise<Array<{ name: string; blob: Blob }>>

拆分合图。

#### extractFrame(spriteImage: HTMLImageElement, frame: SpriteFrame): Promise<Blob>

提取单个子图。

### ErrorHandler

#### getErrorType(error: unknown): ErrorType

获取错误类型。

#### getErrorMessage(error: unknown): string

获取友好的错误消息。

#### handleError(error: unknown, context?: string): void

处理错误。

#### createError(type: ErrorType, message: string, originalError?: unknown): Error

创建错误对象。

### Logger

#### debug(message: string, ...args: any[]): void

记录调试日志。

#### info(message: string, ...args: any[]): void

记录信息日志。

#### warn(message: string, ...args: any[]): void

记录警告日志。

#### error(message: string, ...args: any[]): void

记录错误日志。

#### logExecution<T>(fn: () => Promise<T>, message: string): Promise<T>

记录函数执行时间。

## 扩展开发

### 开发环境

1. 安装依赖：
   ```bash
   npm install
   ```

2. 构建扩展：
   ```bash
   npm run build
   ```

3. 开发模式（如果需要）：
   ```bash
   npm run dev
   ```

### 添加新功能

1. 在 `src/core/` 目录下添加核心逻辑
2. 在 `src/panels/` 目录下添加面板组件
3. 在 `src/types/` 目录下添加类型定义
4. 更新 `src/core/index.ts` 导出新功能
5. 更新文档

### 测试

1. 在 Cocos Creator 中打开扩展
2. 测试各项功能
3. 查看日志输出
4. 检查错误处理

### 构建

1. 运行构建命令：
   ```bash
   npm run build
   ```

2. 检查构建输出：
   - `dist/browser.cjs` - 主进程代码
   - `dist/panel.cjs` - 面板代码

### 发布

1. 更新版本号
2. 更新更新日志
3. 构建扩展
4. 提交代码
5. 创建发布标签

## 贡献指南

### 代码规范

1. 使用 TypeScript
2. 遵循 ESLint 规则
3. 添加注释
4. 编写测试

### 提交规范

1. 提交前运行构建
2. 检查代码格式
3. 编写清晰的提交信息
4. 关联 Issue

###  Pull Request

1. 创建功能分支
2. 实现功能
3. 编写测试
4. 更新文档
5. 提交 Pull Request

### 问题反馈

1. 创建 Issue
2. 描述问题
3. 提供复现步骤
4. 提供日志信息

## 技术支持

如有问题，请查看：
- [Cocos Creator 扩展开发文档](https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/)
- [Cocos Creator 论坛](https://forum.cocos.org/)

