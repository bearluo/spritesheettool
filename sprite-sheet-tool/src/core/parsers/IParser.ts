import type { SpriteSheetConfig } from '../../types/sprite'

/**
 * 解析器接口
 */
export interface IParser {
  /**
   * 解析器名称
   */
  name: string

  /**
   * 支持的文件扩展名
   */
  extensions: string[]

  /**
   * 解析配置文件
   */
  parse(content: string): SpriteSheetConfig

  /**
   * 导出配置文件
   */
  export(config: SpriteSheetConfig): string

  /**
   * 获取 MIME 类型
   */
  getMimeType(): string
}

