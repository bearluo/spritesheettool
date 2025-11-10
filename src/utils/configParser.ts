import type { SpriteSheetConfig } from '@/types/sprite'
import { parserRegistry } from '@/parsers/ParserRegistry'

/**
 * 自动识别并解析配置文件
 */
export function parseConfig(content: string, filename: string): SpriteSheetConfig {
  const parser = parserRegistry.autoDetectParser(content, filename)
  
  if (!parser) {
    const supportedExts = parserRegistry.getAllExtensions().join(', ')
    throw new Error(`无法识别的配置文件格式。支持格式: ${supportedExts}`)
  }

  return parser.parse(content)
}

/**
 * 导出 JSON 配置（向后兼容）
 */
export function exportJsonConfig(config: SpriteSheetConfig): string {
  const parser = parserRegistry.getParserByExtension('json')
  if (!parser) {
    return JSON.stringify(config, null, 2)
  }
  return parser.export(config)
}

/**
 * 导出 PLIST 配置（向后兼容）
 */
export function exportPlistConfig(config: SpriteSheetConfig): string {
  const parser = parserRegistry.getParserByExtension('plist')
  if (!parser) {
    throw new Error('PLIST 解析器未注册')
  }
  return parser.export(config)
}

/**
 * 下载配置文件
 */
export function downloadConfig(config: SpriteSheetConfig, filename: string = 'sprite-config.json'): void {
  const parser = parserRegistry.getParserByFilename(filename)
  
  if (!parser) {
    // 默认使用 JSON
    const jsonParser = parserRegistry.getParserByExtension('json')
    if (!jsonParser) {
      throw new Error('JSON 解析器未注册')
    }
    const content = jsonParser.export(config)
    const blob = new Blob([content], { type: jsonParser.getMimeType() })
    downloadBlob(blob, filename)
    return
  }

  const content = parser.export(config)
  const blob = new Blob([content], { type: parser.getMimeType() })
  downloadBlob(blob, filename)
}

/**
 * 下载 Blob 文件
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 获取所有支持的解析器
 */
export function getAllParsers() {
  return parserRegistry.getAllParsers()
}

/**
 * 获取所有支持的文件扩展名
 */
export function getAllSupportedExtensions(): string[] {
  return parserRegistry.getAllExtensions()
}

