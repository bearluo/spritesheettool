/**
 * 图片信息类型
 */
export interface ImageInfo {
  id: string
  file: File
  name: string
  width: number
  height: number
  size: number
  url: string
  dataUrl?: string
}

/**
 * 图片处理选项
 */
export interface ImageProcessOptions {
  format?: 'png' | 'jpg' | 'webp'
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

/**
 * 图片加载结果
 */
export interface ImageLoadResult {
  width: number
  height: number
  dataUrl: string
}

