import type { SpriteSheetConfig } from '@/types/sprite'
import type { IParser } from './IParser'

/**
 * JSON 格式解析器
 */
export class JsonParser implements IParser {
  name = 'JSON'
  extensions = ['json']

  parse(content: string): SpriteSheetConfig {
    try {
      const config = JSON.parse(content)
      // 验证配置格式
      if (!config.frames || !Array.isArray(config.frames)) {
        throw new Error('配置文件格式错误：缺少 frames 数组')
      }
      return config
    } catch (error) {
      throw new Error(`JSON 配置文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  export(config: SpriteSheetConfig): string {
    return JSON.stringify(config, null, 2)
  }

  getMimeType(): string {
    return 'application/json'
  }
}

