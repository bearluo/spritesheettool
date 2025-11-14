/**
 * 子图信息
 */
export interface SpriteFrame {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotated?: boolean
  trimmed?: boolean
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

/**
 * 合图配置
 */
export interface SpriteSheetConfig {
  image: string // 合图文件名
  format: string // 图片格式
  size: {
    w: number
    h: number
  }
  scale: number
  frames: SpriteFrame[]
  meta?: {
    app: string
    version: string
    format: string
    size: {
      w: number
      h: number
    }
  }
}
/**
 * PLIST 配置
 */
export interface PlistConfig {
  frames: SpriteFrame[]
  metadata: {
    format: string
    size: string
    textureFileName: string
  }
}

/**
 * 合图选项
 */
export interface SpritePackerOptions {
  padding?: number // 子图之间的间距
  algorithm?: 'simple' | 'bin-packing' // 排列算法
  maxWidth?: number // 最大宽度
  maxHeight?: number // 最大高度
  powerOfTwo?: boolean // 是否使用2的幂次方尺寸
  smart?: boolean // MaxRects 智能模式
  square?: boolean // MaxRects 正方形排列
  allowRotation?: boolean // MaxRects 是否允许旋转
  tag?: boolean // MaxRects 标签分组
  exclusiveTag?: boolean // MaxRects 标签独占 bin
  border?: number // MaxRects 边缘留白
  logic?: 'max-area' | 'max-edge' // MaxRects 排序逻辑
}

/**
 * 合图结果
 */
export interface SpritePackerResult {
  canvas: HTMLCanvasElement
  config: SpriteSheetConfig
  width: number
  height: number
}

