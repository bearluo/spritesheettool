import type { IParser } from './IParser'
import { JsonParser } from './JsonParser'
import { PlistParser } from './PlistParser'

/**
 * 解析器注册表
 */
class ParserRegistry {
  private parsers: Map<string, IParser> = new Map()

  constructor() {
    // 注册默认解析器
    this.register(new JsonParser())
    this.register(new PlistParser())
  }

  /**
   * 注册解析器
   */
  register(parser: IParser): void {
    for (const ext of parser.extensions) {
      this.parsers.set(ext.toLowerCase(), parser)
    }
  }

  /**
   * 根据文件扩展名获取解析器
   */
  getParserByExtension(ext: string): IParser | null {
    return this.parsers.get(ext.toLowerCase()) || null
  }

  /**
   * 根据文件名获取解析器
   */
  getParserByFilename(filename: string): IParser | null {
    const ext = filename.toLowerCase().split('.').pop()
    return ext ? this.getParserByExtension(ext) : null
  }

  /**
   * 尝试自动识别解析器
   */
  autoDetectParser(content: string, filename: string): IParser | null {
    // 首先尝试根据文件扩展名
    const parserByExt = this.getParserByFilename(filename)
    if (parserByExt) {
      return parserByExt
    }

    // 尝试根据内容自动识别
    for (const parser of this.parsers.values()) {
      try {
        parser.parse(content)
        return parser
      } catch {
        // 继续尝试下一个解析器
      }
    }

    return null
  }

  /**
   * 获取所有注册的解析器
   */
  getAllParsers(): IParser[] {
    const seen = new Set<IParser>()
    return Array.from(this.parsers.values()).filter(parser => {
      if (seen.has(parser)) {
        return false
      }
      seen.add(parser)
      return true
    })
  }

  /**
   * 获取所有支持的文件扩展名
   */
  getAllExtensions(): string[] {
    return Array.from(this.parsers.keys())
  }
}

// 导出单例实例
export const parserRegistry = new ParserRegistry()

