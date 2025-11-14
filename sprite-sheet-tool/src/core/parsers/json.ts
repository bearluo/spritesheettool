import type { SpriteSheetConfig } from '../../types/sprite'
import type { IParser } from './IParser'
import { ErrorHandler, ErrorType } from '../errorHandler'
import { Logger } from '../logger'

/**
 * JSON 格式解析器
 */
export class JsonParser implements IParser {
  name = 'JSON'
  extensions = ['json']

  parse(content: string): SpriteSheetConfig {
    try {
      Logger.debug('解析 JSON 配置文件', `大小: ${content.length} 字符`)
      const config = JSON.parse(content)
      // 验证配置格式
      if (!config.frames || !Array.isArray(config.frames)) {
        throw ErrorHandler.createError(ErrorType.INVALID_CONFIG, '配置文件格式错误：缺少 frames 数组')
      }
      Logger.debug('JSON 配置文件解析成功', `子图数量: ${config.frames.length}`)
      return config
    } catch (error) {
      Logger.error('JSON 配置文件解析失败', error)
      ErrorHandler.handleError(error, 'JsonParser.parse')
      throw ErrorHandler.createError(
        ErrorType.INVALID_CONFIG,
        ErrorHandler.getErrorMessage(error),
        error
      )
    }
  }

  export(config: SpriteSheetConfig): string {
    return JSON.stringify(config, null, 2)
  }

  getMimeType(): string {
    return 'application/json'
  }
}
