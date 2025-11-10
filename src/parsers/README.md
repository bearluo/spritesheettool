# 解析器模块

这个目录包含了所有配置文件解析器的实现。使用解析器模式，方便扩展新的配置格式。

## 目录结构

```
parsers/
├── IParser.ts          # 解析器接口定义
├── JsonParser.ts       # JSON 格式解析器
├── PlistParser.ts      # PLIST 格式解析器
├── ParserRegistry.ts   # 解析器注册表
├── parserUtils.ts      # 共享工具函数
├── index.ts           # 统一导出
└── README.md          # 说明文档
```

## 如何添加新的解析器

### 1. 创建解析器类

创建一个新文件，例如 `XmlParser.ts`：

```typescript
import type { SpriteSheetConfig } from '@/types/sprite'
import type { IParser } from './IParser'

export class XmlParser implements IParser {
  name = 'XML'
  extensions = ['xml']

  parse(content: string): SpriteSheetConfig {
    // 实现解析逻辑
    // 将 XML 内容转换为 SpriteSheetConfig
  }

  export(config: SpriteSheetConfig): string {
    // 实现导出逻辑
    // 将 SpriteSheetConfig 转换为 XML 字符串
  }

  getMimeType(): string {
    return 'application/xml'
  }
}
```

### 2. 注册解析器

在 `ParserRegistry.ts` 中注册新解析器：

```typescript
import { XmlParser } from './XmlParser'

class ParserRegistry {
  constructor() {
    // 注册默认解析器
    this.register(new JsonParser())
    this.register(new PlistParser())
    this.register(new XmlParser()) // 添加新解析器
  }
}
```

### 3. 导出新解析器（可选）

在 `index.ts` 中导出新解析器：

```typescript
export { XmlParser } from './XmlParser'
```

## 使用示例

```typescript
import { parserRegistry } from '@/parsers/ParserRegistry'

// 根据文件扩展名获取解析器
const parser = parserRegistry.getParserByExtension('json')

// 解析配置文件
const config = parser.parse(content)

// 导出配置文件
const exported = parser.export(config)

// 自动识别解析器
const autoParser = parserRegistry.autoDetectParser(content, 'config.xml')
```

## 解析器接口说明

### IParser

所有解析器都必须实现 `IParser` 接口：

- `name: string` - 解析器名称
- `extensions: string[]` - 支持的文件扩展名数组
- `parse(content: string): SpriteSheetConfig` - 解析配置文件
- `export(config: SpriteSheetConfig): string` - 导出配置文件
- `getMimeType(): string` - 获取 MIME 类型

## 注意事项

1. 解析器应该是无状态的，可以安全地多次使用
2. 解析错误应该抛出有意义的错误信息
3. 导出时应该保持配置数据的完整性
4. 支持的扩展名应该是小写的

