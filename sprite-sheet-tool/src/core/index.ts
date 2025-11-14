/**
 * 核心逻辑模块导出
 */

// 打包逻辑
export { packSprites } from './packer'

// 拆包逻辑
export { unpackSprites, extractFrame } from './unpacker'

// 打包算法
export { simplePack, maxRectsPack } from './algorithms'
export type { PackedFrame, PackedLayout } from './algorithms'

// 图片处理工具
export {
  loadImage,
  getImageInfo,
  compressImage,
  downloadImage,
  createImageElement
} from './imageUtils'

// 解析器
export { JsonParser } from './parsers/json'
export { PlistParser } from './parsers/plist'
export type { IParser } from './parsers/IParser'
export { parseSize, parsePoint, parseRect } from './parsers/parserUtils'

// Cocos Creator API
export { CocosApi } from './cocosApi'

// 文件操作
export { FileOperations } from './fileOperations'

// 错误处理
export { ErrorHandler, ErrorType } from './errorHandler'

// 日志
export { Logger, LogLevel } from './logger'

// 类型定义
export type { ImageInfo, ImageLoadResult, ImageProcessOptions } from '../types/image'
export type {
  SpriteFrame,
  SpriteSheetConfig,
  SpritePackerOptions,
  SpritePackerResult
} from '../types/sprite'

