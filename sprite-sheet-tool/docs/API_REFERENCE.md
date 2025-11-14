# Sprite Sheet Tool - API 参考

## 核心模块

### CocosApi

Cocos Creator API 封装类。

#### 方法

##### getProjectPath(): Promise<string>

获取项目路径。

**返回**：项目路径字符串

**示例**：
```typescript
const projectPath = await CocosApi.getProjectPath()
```

##### readAssetByPath(assetPath: string): Promise<ArrayBuffer>

读取资源文件。

**参数**：
- `assetPath`：资源路径（相对于项目根目录）

**返回**：资源文件的 ArrayBuffer

**示例**：
```typescript
const data = await CocosApi.readAssetByPath('assets/image.png')
```

##### writeAsset(assetPath: string, data: ArrayBuffer): Promise<void>

写入资源文件。

**参数**：
- `assetPath`：资源路径（相对于项目根目录）
- `data`：资源数据的 ArrayBuffer

**返回**：Promise<void>

**示例**：
```typescript
await CocosApi.writeAsset('assets/image.png', arrayBuffer)
```

##### refreshAssetDatabase(assetPath?: string): Promise<void>

刷新资源数据库。

**参数**：
- `assetPath`：资源路径（可选，不传则刷新整个数据库）

**返回**：Promise<void>

**示例**：
```typescript
await CocosApi.refreshAssetDatabase()
await CocosApi.refreshAssetDatabase('assets/image.png')
```

### FileOperations

文件操作封装类。

#### 方法

##### readImage(assetPath: string): Promise<ArrayBuffer>

读取图片文件。

**参数**：
- `assetPath`：图片路径（相对于项目根目录）

**返回**：图片文件的 ArrayBuffer

**示例**：
```typescript
const data = await FileOperations.readImage('assets/image.png')
```

##### writeImage(assetPath: string, canvas: HTMLCanvasElement): Promise<void>

写入图片文件。

**参数**：
- `assetPath`：图片路径（相对于项目根目录）
- `canvas`：Canvas 元素

**返回**：Promise<void>

**示例**：
```typescript
await FileOperations.writeImage('assets/image.png', canvas)
```

##### writeConfig(assetPath: string, content: string): Promise<void>

写入配置文件。

**参数**：
- `assetPath`：配置文件路径（相对于项目根目录）
- `content`：配置文件内容

**返回**：Promise<void>

**示例**：
```typescript
await FileOperations.writeConfig('assets/config.json', jsonString)
```

### Packer

打包逻辑。

#### 方法

##### packSprites(images: ImageInfo[], options?: SpritePackerOptions): Promise<SpritePackerResult>

打包合图。

**参数**：
- `images`：图片信息数组
- `options`：打包选项（可选）

**返回**：打包结果

**示例**：
```typescript
const result = await packSprites(images, {
  algorithm: 'bin-packing',
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  allowRotation: true
})
```

### Unpacker

拆包逻辑。

#### 方法

##### unpackSprites(spriteImageUrl: string, config: SpriteSheetConfig): Promise<Array<{ name: string; blob: Blob }>>

拆分合图。

**参数**：
- `spriteImageUrl`：合图图片 URL
- `config`：合图配置

**返回**：子图数组

**示例**：
```typescript
const results = await unpackSprites(imageUrl, config)
```

##### extractFrame(spriteImage: HTMLImageElement, frame: SpriteFrame): Promise<Blob>

提取单个子图。

**参数**：
- `spriteImage`：合图图片元素
- `frame`：子图帧信息

**返回**：子图 Blob

**示例**：
```typescript
const blob = await extractFrame(spriteImage, frame)
```

### ErrorHandler

错误处理模块。

#### 方法

##### getErrorType(error: unknown): ErrorType

获取错误类型。

**参数**：
- `error`：错误对象

**返回**：错误类型

**示例**：
```typescript
const errorType = ErrorHandler.getErrorType(error)
```

##### getErrorMessage(error: unknown): string

获取友好的错误消息。

**参数**：
- `error`：错误对象

**返回**：错误消息字符串

**示例**：
```typescript
const errorMessage = ErrorHandler.getErrorMessage(error)
```

##### handleError(error: unknown, context?: string): void

处理错误。

**参数**：
- `error`：错误对象
- `context`：上下文信息（可选）

**返回**：void

**示例**：
```typescript
ErrorHandler.handleError(error, '操作名称')
```

##### createError(type: ErrorType, message: string, originalError?: unknown): Error

创建错误对象。

**参数**：
- `type`：错误类型
- `message`：错误消息
- `originalError`：原始错误（可选）

**返回**：错误对象

**示例**：
```typescript
const error = ErrorHandler.createError(ErrorType.FILE_READ_ERROR, '文件读取失败', originalError)
```

### Logger

日志模块。

#### 方法

##### debug(message: string, ...args: any[]): void

记录调试日志。

**参数**：
- `message`：日志消息
- `args`：额外参数

**返回**：void

**示例**：
```typescript
Logger.debug('调试信息', data)
```

##### info(message: string, ...args: any[]): void

记录信息日志。

**参数**：
- `message`：日志消息
- `args`：额外参数

**返回**：void

**示例**：
```typescript
Logger.info('信息', data)
```

##### warn(message: string, ...args: any[]): void

记录警告日志。

**参数**：
- `message`：日志消息
- `args`：额外参数

**返回**：void

**示例**：
```typescript
Logger.warn('警告', data)
```

##### error(message: string, ...args: any[]): void

记录错误日志。

**参数**：
- `message`：日志消息
- `args`：额外参数

**返回**：void

**示例**：
```typescript
Logger.error('错误', error)
```

##### logExecution<T>(fn: () => Promise<T>, message: string): Promise<T>

记录函数执行时间。

**参数**：
- `fn`：要执行的函数
- `message`：日志消息

**返回**：函数执行结果

**示例**：
```typescript
const result = await Logger.logExecution(async () => {
  // 操作
}, '操作名称')
```

## 类型定义

### ImageInfo

图片信息接口。

```typescript
interface ImageInfo {
  id: string
  file: File
  name: string
  width: number
  height: number
  size: number
  url: string
  dataUrl?: string
}
```

### SpritePackerOptions

打包选项接口。

```typescript
interface SpritePackerOptions {
  algorithm?: 'simple' | 'bin-packing'
  maxWidth?: number
  maxHeight?: number
  padding?: number
  allowRotation?: boolean
  powerOfTwo?: boolean
  square?: boolean
}
```

### SpritePackerResult

打包结果接口。

```typescript
interface SpritePackerResult {
  canvas: HTMLCanvasElement
  config: SpriteSheetConfig
  width: number
  height: number
}
```

### SpriteSheetConfig

合图配置接口。

```typescript
interface SpriteSheetConfig {
  image: string
  format: string
  size: {
    w: number
    h: number
  }
  scale: number
  frames: SpriteFrame[]
  meta: {
    app: string
    version: string
    format: string
    size: {
      w: number
      h: number
    }
  }
}
```

### SpriteFrame

子图帧接口。

```typescript
interface SpriteFrame {
  id?: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotated?: boolean
  sourceSize?: {
    w: number
    h: number
  }
  spriteSourceSize?: {
    x: number
    y: number
    w: number
    h: number
  }
}
```

### ErrorType

错误类型枚举。

```typescript
enum ErrorType {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_CONFIG = 'INVALID_CONFIG',
  IMAGE_PROCESS_ERROR = 'IMAGE_PROCESS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### LogLevel

日志级别枚举。

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}
```

## 使用示例

### 打包合图

```typescript
import { packSprites, FileOperations, CocosApi } from './core'

// 准备图片
const images = [/* ImageInfo[] */]

// 打包
const result = await packSprites(images, {
  algorithm: 'bin-packing',
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  allowRotation: true
})

// 保存到项目
await FileOperations.writeImage('assets/sprite.png', result.canvas)
await FileOperations.writeConfig('assets/sprite.json', JSON.stringify(result.config, null, 2))
await CocosApi.refreshAssetDatabase()
```

### 拆分合图

```typescript
import { unpackSprites, FileOperations, CocosApi, JsonParser } from './core'

// 加载配置
const configText = await FileOperations.readConfig('assets/sprite.json')
const parser = new JsonParser()
const config = parser.parse(configText)

// 拆分
const results = await unpackSprites('assets/sprite.png', config)

// 保存到项目
for (const result of results) {
  await FileOperations.writeImageFromBlob(`assets/sprites/${result.name}`, result.blob)
}
await CocosApi.refreshAssetDatabase()
```

### 错误处理

```typescript
import { ErrorHandler, ErrorType, Logger } from './core'

try {
  // 操作
} catch (error) {
  const errorMessage = ErrorHandler.getErrorMessage(error)
  Logger.error('操作失败', error)
  ErrorHandler.handleError(error, '操作名称')
  throw ErrorHandler.createError(ErrorType.FILE_READ_ERROR, errorMessage, error)
}
```

### 日志记录

```typescript
import { Logger } from './core'

Logger.debug('调试信息', data)
Logger.info('信息', data)
Logger.warn('警告', data)
Logger.error('错误', error)

// 记录函数执行时间
const result = await Logger.logExecution(async () => {
  // 操作
}, '操作名称')
```

